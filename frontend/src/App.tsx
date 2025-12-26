import { useEffect } from 'react';
import { useAppStore } from './store/appStore';
import { performanceService } from './services/performanceService';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';
import Settings from './components/Settings';
import './App.css';

function App() {
  const { theme, isSettingsOpen, initializeBackend } = useAppStore();

  useEffect(() => {
    // Set theme
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Initialize performance optimizations
    performanceService.isLowEnd();
    
    // Initialize backend connection
    initializeBackend();

    // Listen for Electron events
    if (window.electronAPI) {
      window.electronAPI.onFocusChatInput(() => {
        const input = document.querySelector<HTMLTextAreaElement>('[data-chat-input]');
        input?.focus();
      });

      window.electronAPI.onOpenSettings(() => {
        useAppStore.getState().setSettingsOpen(true);
      });
    }

    return () => {
      // Cleanup performance monitoring
      performanceService.cleanup();
      
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('focus-chat-input');
        window.electronAPI.removeAllListeners('open-settings');
      }
    };
  }, [initializeBackend]);

  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <ChatInterface />
      </main>
      {isSettingsOpen && <Settings />}
    </div>
  );
}

export default App;
