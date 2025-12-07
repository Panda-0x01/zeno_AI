// Electron API types
export interface ElectronAPI {
  getBackendConfig: () => Promise<BackendConfig>;
  showSaveDialog: (options: any) => Promise<any>;
  showOpenDialog: (options: any) => Promise<any>;
  showMessageBox: (options: any) => Promise<any>;
  onBackendConfig: (callback: (config: BackendConfig) => void) => void;
  onFocusChatInput: (callback: () => void) => void;
  onOpenSettings: (callback: () => void) => void;
  removeAllListeners: (channel: string) => void;
}

export interface BackendConfig {
  port: number;
  token: string;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    platform?: {
      os: string;
      arch: string;
      version: any;
    };
  }
}

// Message types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  streaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

// Ollama types
export interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
  digest: string;
}

export interface ModelInfo {
  name: string;
  displayName: string;
  size: string;
  capabilities: string[];
}

// Settings types
export interface AppSettings {
  model: string;
  maxTokens: number;
  temperature: number;
  sttEngine: 'web' | 'whisper' | 'vosk';
  ttsEngine: 'web' | 'coqui' | 'pyttsx3';
  ttsVoice: string;
  wakeWordEnabled: boolean;
  wakeWord: string;
  pushToTalk: boolean;
  theme: 'light' | 'dark';
  encryptionEnabled: boolean;
  auditLogEnabled: boolean;
  requireConfirmation: boolean;
}

// Voice types
export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

// Action types
export interface ActionRequest {
  type: 'shell' | 'file' | 'app' | 'notification';
  command: string;
  description: string;
  requiresConfirmation: boolean;
}

export interface ActionResponse {
  success: boolean;
  output?: string;
  error?: string;
}

// WebSocket message types
export interface WSMessage {
  type: 'chat' | 'stream' | 'action' | 'models' | 'settings' | 'error';
  data: any;
  requestId?: string;
}

// Plugin types
export interface Plugin {
  id: string;
  name: string;
  description: string;
  commands: PluginCommand[];
  enabled: boolean;
}

export interface PluginCommand {
  name: string;
  description: string;
  parameters: PluginParameter[];
}

export interface PluginParameter {
  name: string;
  type: 'string' | 'number' | 'boolean';
  required: boolean;
  description: string;
}
