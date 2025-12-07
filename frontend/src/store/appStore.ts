import { create } from 'zustand';
import { Conversation, Message, AppSettings, OllamaModel } from '../types';
import { BackendService } from '../services/backendService';

interface AppState {
  // UI state
  theme: 'light' | 'dark';
  isSettingsOpen: boolean;
  isSidebarCollapsed: boolean;

  // Conversations
  conversations: Conversation[];
  currentConversationId: string | null;

  // Models
  availableModels: OllamaModel[];
  currentModel: string;

  // Settings
  settings: AppSettings;

  // Backend
  backendService: BackendService | null;
  isBackendConnected: boolean;

  // Voice
  isListening: boolean;
  isSpeaking: boolean;

  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  setSettingsOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  createConversation: () => void;
  deleteConversation: (id: string) => void;
  setCurrentConversation: (id: string) => void;
  
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  
  setAvailableModels: (models: OllamaModel[]) => void;
  setCurrentModel: (model: string) => void;
  
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  initializeBackend: () => Promise<void>;
  setBackendConnected: (connected: boolean) => void;
  
  setListening: (listening: boolean) => void;
  setSpeaking: (speaking: boolean) => void;
}

const defaultSettings: AppSettings = {
  model: 'llama2',
  maxTokens: 4096,
  temperature: 0.7,
  sttEngine: 'web',
  ttsEngine: 'web',
  ttsVoice: '',
  wakeWordEnabled: false,
  wakeWord: 'jarvis',
  pushToTalk: true,
  theme: 'dark',
  encryptionEnabled: false,
  auditLogEnabled: true,
  requireConfirmation: true,
};

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  theme: 'dark',
  isSettingsOpen: false,
  isSidebarCollapsed: false,
  conversations: [],
  currentConversationId: null,
  availableModels: [],
  currentModel: 'llama2',
  settings: defaultSettings,
  backendService: null,
  isBackendConnected: false,
  isListening: false,
  isSpeaking: false,

  // Actions
  setTheme: (theme) => set({ theme }),
  
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),

  createConversation: () => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((state) => ({
      conversations: [newConversation, ...state.conversations],
      currentConversationId: newConversation.id,
    }));
  },

  deleteConversation: (id) => {
    set((state) => {
      const filtered = state.conversations.filter((c) => c.id !== id);
      return {
        conversations: filtered,
        currentConversationId:
          state.currentConversationId === id
            ? filtered[0]?.id || null
            : state.currentConversationId,
      };
    });
  },

  setCurrentConversation: (id) => set({ currentConversationId: id }),

  addMessage: (message) => {
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    set((state) => {
      const conversations = state.conversations.map((conv) => {
        if (conv.id === state.currentConversationId) {
          const updatedMessages = [...conv.messages, newMessage];
          
          // Update title from first user message
          const title =
            conv.messages.length === 0 && message.role === 'user'
              ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
              : conv.title;

          const updatedConv = {
            ...conv,
            messages: updatedMessages,
            title,
            updatedAt: Date.now(),
          };

          // Auto-save to database
          if (state.backendService) {
            state.backendService.saveConversation(updatedConv.id, updatedConv.title, updatedConv.model);
            state.backendService.saveMessage(newMessage.id, conv.id, newMessage.role, newMessage.content);
          }

          return updatedConv;
        }
        return conv;
      });

      return { conversations };
    });
  },

  updateMessage: (id, updates) => {
    set((state) => {
      const conversations = state.conversations.map((conv) => {
        if (conv.id === state.currentConversationId) {
          return {
            ...conv,
            messages: conv.messages.map((msg) =>
              msg.id === id ? { ...msg, ...updates } : msg
            ),
            updatedAt: Date.now(),
          };
        }
        return conv;
      });

      return { conversations };
    });
  },

  setAvailableModels: (models) => set({ availableModels: models }),

  setCurrentModel: (model) => set({ currentModel: model }),

  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),

  initializeBackend: async () => {
    try {
      const service = new BackendService();
      await service.connect();
      
      set({ backendService: service, isBackendConnected: true });

      // Load available models (don't fail if this doesn't work)
      try {
        const models = await service.getModels();
        set({ availableModels: models });
      } catch (modelError) {
        // Silently fail - models will load eventually
        set({ availableModels: [] });
      }

      // Load conversations from database
      try {
        const savedConversations = await service.loadConversations();
        if (savedConversations.length > 0) {
          // Load messages for each conversation
          const conversationsWithMessages = await Promise.all(
            savedConversations.map(async (conv: any) => {
              const messages = await service.loadMessages(conv.id);
              return {
                id: conv.id,
                title: conv.title,
                model: conv.model,
                messages: messages.map((msg: any) => ({
                  id: msg.id,
                  role: msg.role,
                  content: msg.content,
                  timestamp: new Date(msg.created_at).getTime(),
                })),
                createdAt: new Date(conv.created_at).getTime(),
                updatedAt: new Date(conv.updated_at).getTime(),
              };
            })
          );
          set({ conversations: conversationsWithMessages });
          // Set first conversation as current
          if (conversationsWithMessages.length > 0) {
            set({ currentConversationId: conversationsWithMessages[0].id });
          }
        }
      } catch (dbError) {
        console.warn('Could not load conversations from database:', dbError);
      }

      // Create initial conversation if none exists
      if (get().conversations.length === 0) {
        get().createConversation();
      }
    } catch (error) {
      console.error('Failed to initialize backend:', error);
      set({ isBackendConnected: false });
    }
  },

  setBackendConnected: (connected) => set({ isBackendConnected: connected }),

  setListening: (listening) => set({ isListening: listening }),

  setSpeaking: (speaking) => set({ isSpeaking: speaking }),
}));
