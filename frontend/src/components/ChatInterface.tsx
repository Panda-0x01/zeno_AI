import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store/appStore';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import './ChatInterface.css';

export default function ChatInterface() {
  const {
    conversations,
    currentConversationId,
    backendService,
    addMessage,
    updateMessage,
    currentModel,
    availableModels,
  } = useAppStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const currentConversation = conversations.find((c) => c.id === currentConversationId);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSendMessage = async (content: string) => {
    console.log('[SEND] handleSendMessage called', { backendService: !!backendService, currentConversation: !!currentConversation, isGenerating });
    
    if (!backendService || !currentConversation || isGenerating) {
      console.log('[SEND] Blocked - missing requirements');
      return;
    }

    console.log('[SEND] Sending message:', content);
    // Add user message
    addMessage({ role: 'user', content });

    // Add assistant message placeholder
    const assistantMessageId = crypto.randomUUID();
    addMessage({
      role: 'assistant',
      content: '',
      streaming: true,
    });

    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    try {
      // Prepare messages for API
      const messages = [
        ...currentConversation.messages,
        { role: 'user', content },
      ].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      let fullResponse = '';
      let hasReceivedData = false;

      // Set a timeout to detect if Ollama is not responding
      const timeoutId = setTimeout(() => {
        if (!hasReceivedData) {
          const conv = useAppStore.getState().conversations.find(
            (c) => c.id === currentConversationId
          );
          const lastMessage = conv?.messages[conv.messages.length - 1];
          
          if (lastMessage && lastMessage.role === 'assistant' && !lastMessage.content) {
            updateMessage(lastMessage.id, {
              content: '⚠️ Ollama is not responding. Please make sure:\n\n1. Ollama is installed (https://ollama.ai/download)\n2. Ollama is running (run: ollama serve)\n3. You have pulled a model (run: ollama pull llama2)\n\nThen restart Zeno.',
              streaming: false,
            });
            setIsGenerating(false);
          }
        }
      }, 10000); // 10 second timeout

      await backendService.sendChat(
        messages,
        currentModel,
        (chunk) => {
          hasReceivedData = true;
          clearTimeout(timeoutId);
          fullResponse += chunk;
          
          // Find the assistant message and update it
          const conv = useAppStore.getState().conversations.find(
            (c) => c.id === currentConversationId
          );
          const lastMessage = conv?.messages[conv.messages.length - 1];
          
          if (lastMessage && lastMessage.role === 'assistant') {
            updateMessage(lastMessage.id, {
              content: fullResponse,
              streaming: true,
            });
          }
        }
      );

      clearTimeout(timeoutId);

      // Mark streaming as complete
      const conv = useAppStore.getState().conversations.find(
        (c) => c.id === currentConversationId
      );
      const lastMessage = conv?.messages[conv.messages.length - 1];
      
      if (lastMessage && lastMessage.role === 'assistant') {
        updateMessage(lastMessage.id, {
          streaming: false,
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      // Update message with error
      const conv = useAppStore.getState().conversations.find(
        (c) => c.id === currentConversationId
      );
      const lastMessage = conv?.messages[conv.messages.length - 1];
      
      if (lastMessage && lastMessage.role === 'assistant') {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        let helpfulMessage = `Error: ${errorMessage}\n\n`;
        
        if (errorMessage.includes('Failed to list models') || errorMessage.includes('Connection') || errorMessage.includes('timeout')) {
          helpfulMessage += '**Ollama is not running!**\n\nPlease:\n1. Install Ollama from https://ollama.ai/download\n2. Run: ollama serve\n3. Pull a model: ollama pull llama2\n4. Restart Zeno';
        }
        
        updateMessage(lastMessage.id, {
          content: helpfulMessage,
          streaming: false,
        });
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  };

  if (!currentConversation) {
    return (
      <div className="chat-interface empty">
        <div className="empty-state">
          <h2>Welcome to Zeno</h2>
          <p>Your local AI assistant powered by Ollama</p>
          {availableModels.length === 0 && (
            <div className="warning-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
              </svg>
              <div>
                <strong>Ollama Not Detected</strong>
                <p>Install Ollama to enable AI chat</p>
                <a href="https://ollama.ai/download" target="_blank" rel="noopener noreferrer">
                  Download Ollama
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="chat-interface">
      {availableModels.length === 0 && (
        <div className="status-banner warning">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
          <span>Ollama not connected. Install from <a href="https://ollama.ai/download" target="_blank" rel="noopener noreferrer">ollama.ai</a> and run: ollama pull llama2</span>
        </div>
      )}
      <MessageList
        messages={currentConversation.messages}
        isGenerating={isGenerating}
      />
      <ChatInput
        onSend={handleSendMessage}
        onStop={handleStopGeneration}
        isGenerating={isGenerating}
        disabled={!backendService}
      />
    </div>
  );
}
