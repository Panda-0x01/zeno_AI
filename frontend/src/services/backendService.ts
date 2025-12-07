import { BackendConfig, OllamaModel, WSMessage, ActionRequest, ActionResponse } from '../types';

export class BackendService {
  private ws: WebSocket | null = null;
  private config: BackendConfig | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  async connect(): Promise<void> {
    // Get backend config from Electron
    if (window.electronAPI) {
      this.config = await window.electronAPI.getBackendConfig();
    } else {
      // Fallback for web development - read from localStorage or use empty token
      const storedToken = localStorage.getItem('ws_token') || '';
      this.config = { port: 8765, token: storedToken };
    }

    return this.connectWebSocket();
  }

  private connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = `ws://127.0.0.1:${this.config!.port}/ws?token=${this.config!.token}`;
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket closed');
        this.attemptReconnect();
      };
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
      
      setTimeout(() => {
        this.connectWebSocket().catch((error) => {
          console.error('Reconnection failed:', error);
        });
      }, 2000 * this.reconnectAttempts);
    }
  }

  private handleMessage(message: WSMessage): void {
    if (message.requestId && this.messageHandlers.has(message.requestId)) {
      const handler = this.messageHandlers.get(message.requestId)!;
      handler(message.data);
      
      if (message.type !== 'stream') {
        this.messageHandlers.delete(message.requestId);
      }
    }
  }

  private sendMessage(type: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const requestId = crypto.randomUUID();
      const message: WSMessage = { type, data, requestId };

      this.messageHandlers.set(requestId, (responseData) => {
        if (responseData.error) {
          reject(new Error(responseData.error));
        } else {
          resolve(responseData);
        }
      });

      this.ws.send(JSON.stringify(message));

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.messageHandlers.has(requestId)) {
          this.messageHandlers.delete(requestId);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  async getModels(): Promise<OllamaModel[]> {
    const response = await this.sendMessage('models', {});
    return response.models || [];
  }

  async sendChat(
    messages: Array<{ role: string; content: string }>,
    model: string,
    onStream?: (chunk: string) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const requestId = crypto.randomUUID();
      let fullResponse = '';

      this.messageHandlers.set(requestId, (data) => {
        if (data.error) {
          this.messageHandlers.delete(requestId);
          reject(new Error(data.error));
        } else if (data.done) {
          this.messageHandlers.delete(requestId);
          resolve(fullResponse);
        } else if (data.chunk) {
          fullResponse += data.chunk;
          if (onStream) {
            onStream(data.chunk);
          }
        }
      });

      const message: WSMessage = {
        type: 'chat',
        data: { messages, model },
        requestId,
      };

      this.ws.send(JSON.stringify(message));

      // Timeout after 2 minutes
      setTimeout(() => {
        if (this.messageHandlers.has(requestId)) {
          this.messageHandlers.delete(requestId);
          reject(new Error('Chat request timeout'));
        }
      }, 120000);
    });
  }

  async executeAction(action: ActionRequest): Promise<ActionResponse> {
    return this.sendMessage('action', action);
  }

  async updateSettings(settings: any): Promise<void> {
    await this.sendMessage('settings', settings);
  }

  async saveConversation(id: string, title: string, model: string): Promise<boolean> {
    const response = await this.sendMessage('save_conversation', { id, title, model });
    return response.success || false;
  }

  async saveMessage(id: string, conversationId: string, role: string, content: string): Promise<boolean> {
    const response = await this.sendMessage('save_message', { id, conversationId, role, content });
    return response.success || false;
  }

  async loadConversations(): Promise<any[]> {
    const response = await this.sendMessage('load_conversations', {});
    return response.conversations || [];
  }

  async loadMessages(conversationId: string): Promise<any[]> {
    const response = await this.sendMessage('load_messages', { conversationId });
    return response.messages || [];
  }

  async deleteConversation(conversationId: string): Promise<boolean> {
    const response = await this.sendMessage('delete_conversation', { conversationId });
    return response.success || false;
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
  }
}
