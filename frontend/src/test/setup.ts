import '@testing-library/jest-dom';

// Mock Electron API
global.window.electronAPI = {
  getBackendConfig: async () => ({ port: 8765, token: 'test-token' }),
  showSaveDialog: async () => ({ canceled: false, filePath: '/test/path' }),
  showOpenDialog: async () => ({ canceled: false, filePaths: ['/test/path'] }),
  showMessageBox: async () => ({ response: 0 }),
  onBackendConfig: () => {},
  onFocusChatInput: () => {},
  onOpenSettings: () => {},
  removeAllListeners: () => {},
};

// Mock WebSocket
class MockWebSocket {
  onopen: (() => void) | null = null;
  onmessage: ((event: any) => void) | null = null;
  onerror: ((error: any) => void) | null = null;
  onclose: (() => void) | null = null;
  readyState = 1; // OPEN

  constructor(public url: string) {
    setTimeout(() => {
      if (this.onopen) this.onopen();
    }, 0);
  }

  send(data: string) {
    // Mock send
  }

  close() {
    if (this.onclose) this.onclose();
  }
}

global.WebSocket = MockWebSocket as any;
