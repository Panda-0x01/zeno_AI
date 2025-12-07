import { app, BrowserWindow, ipcMain, Tray, Menu, globalShortcut, dialog } from 'electron';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;
let tray = null;
let pythonProcess = null;
let wsToken = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const BACKEND_PORT = 8765;

// Generate secure WebSocket token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Start Python backend
function startPythonBackend() {
  return new Promise((resolve, reject) => {
    const pythonExe = process.platform === 'win32' ? 'python.exe' : 'python';
    const pythonPath = isDev
      ? path.join(__dirname, '..', 'backend', 'venv', process.platform === 'win32' ? 'Scripts' : 'bin', pythonExe)
      : path.join(process.resourcesPath, 'backend', 'venv', process.platform === 'win32' ? 'Scripts' : 'bin', pythonExe);
    
    const backendScript = isDev
      ? path.join(__dirname, '..', 'backend', 'main.py')
      : path.join(process.resourcesPath, 'backend', 'main.py');

    // Read token from .env file if it exists
    const envPath = isDev
      ? path.join(__dirname, '..', 'backend', '.env')
      : path.join(process.resourcesPath, 'backend', '.env');
    
    let envToken = wsToken;
    try {
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const tokenMatch = envContent.match(/WS_SECRET_TOKEN=(.+)/);
        if (tokenMatch && tokenMatch[1].trim()) {
          envToken = tokenMatch[1].trim();
          wsToken = envToken; // Use the token from .env
        }
      }
    } catch (error) {
      console.log('Could not read .env file, using generated token');
    }

    // Check if Python exists
    console.log(`[Electron] Python path: ${pythonPath}`);
    console.log(`[Electron] Backend script: ${backendScript}`);
    console.log(`[Electron] Python exists: ${fs.existsSync(pythonPath)}`);
    
    if (!fs.existsSync(pythonPath)) {
      console.log('[Electron] Python venv not found, using system Python');
      // Fallback to system Python
      const systemPython = process.platform === 'win32' ? 'python' : 'python3';
      pythonProcess = spawn(systemPython, [backendScript], {
        env: {
          ...process.env,
          WS_SECRET_TOKEN: envToken,
          BACKEND_PORT: BACKEND_PORT.toString(),
        },
      });
    } else {
      console.log('[Electron] Using venv Python');
      pythonProcess = spawn(pythonPath, [backendScript], {
        env: {
          ...process.env,
          WS_SECRET_TOKEN: envToken,
          BACKEND_PORT: BACKEND_PORT.toString(),
        },
      });
    }

    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[Python Backend] ${output}`);
      if (output.includes('Server started')) {
        resolve();
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      const error = data.toString();
      console.error(`[Python Backend Error] ${error}`);
      // Show error dialog for critical errors
      if (error.includes('ModuleNotFoundError') || error.includes('ImportError')) {
        console.error('CRITICAL: Missing Python dependencies. Run: backend\\venv\\Scripts\\python.exe -m pip install -r backend\\requirements.txt');
      }
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python backend exited with code ${code}`);
      if (code !== 0 && mainWindow) {
        dialog.showErrorBox(
          'Backend Error',
          'Python backend crashed. Please check logs and restart the application.'
        );
      }
    });

    // Timeout if backend doesn't start
    setTimeout(() => {
      if (pythonProcess && !pythonProcess.killed) {
        resolve(); // Continue anyway
      } else {
        reject(new Error('Backend failed to start'));
      }
    }, 10000);
  });
}

// Create main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    show: false,
  });

  // Load frontend
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Send backend config to renderer
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('backend-config', {
      port: BACKEND_PORT,
      token: wsToken,
    });
  });
}

// Create system tray
function createTray() {
  const iconPath = path.join(__dirname, '..', 'build', process.platform === 'darwin' ? 'iconTemplate.png' : 'icon.png');
  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Zeno',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    {
      label: 'Hide Zeno',
      click: () => {
        if (mainWindow) {
          mainWindow.hide();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip('Zeno Assistant');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

// Register global shortcuts
function registerShortcuts() {
  // Toggle main window
  globalShortcut.register('CommandOrControl+Shift+J', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  // Focus chat input
  globalShortcut.register('CommandOrControl+K', () => {
    if (mainWindow && mainWindow.isVisible()) {
      mainWindow.webContents.send('focus-chat-input');
    }
  });

  // Open settings
  globalShortcut.register('CommandOrControl+,', () => {
    if (mainWindow && mainWindow.isVisible()) {
      mainWindow.webContents.send('open-settings');
    }
  });
}

// IPC handlers
function setupIPC() {
  ipcMain.handle('get-backend-config', () => ({
    port: BACKEND_PORT,
    token: wsToken,
  }));

  ipcMain.handle('show-save-dialog', async (event, options) => {
    return dialog.showSaveDialog(mainWindow, options);
  });

  ipcMain.handle('show-open-dialog', async (event, options) => {
    return dialog.showOpenDialog(mainWindow, options);
  });

  ipcMain.handle('show-message-box', async (event, options) => {
    return dialog.showMessageBox(mainWindow, options);
  });
}

// App lifecycle
app.whenReady().then(async () => {
  wsToken = generateToken();
  
  // Setup IPC handlers FIRST before creating window
  setupIPC();

  try {
    await startPythonBackend();
  } catch (error) {
    console.error('Failed to start Python backend:', error);
    dialog.showErrorBox(
      'Startup Error',
      'Failed to start Python backend. Please ensure Python 3.10+ is installed and dependencies are met.'
    );
  }

  createWindow();
  // createTray(); // Disabled - icon missing
  registerShortcuts();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
  globalShortcut.unregisterAll();
});

app.on('will-quit', () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  dialog.showErrorBox('Application Error', error.message);
});
