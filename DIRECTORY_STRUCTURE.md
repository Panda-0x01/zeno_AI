# JARVIS Directory Structure

Complete overview of the project structure and file organization.

## Root Directory

```
jarvis/
├── frontend/                 # React + Vite frontend application
├── backend/                  # Python FastAPI backend
├── electron/                 # Electron main process
├── docs/                     # Documentation
├── scripts/                  # Build and setup scripts
├── .github/                  # GitHub Actions CI/CD
├── package.json             # Root package configuration
├── README.md                # Main documentation
├── QUICK_START.md           # Quick start guide
├── PROJECT_SUMMARY.md       # Project overview
├── DELIVERABLES_CHECKLIST.md # Requirements verification
├── CONTRIBUTING.md          # Contribution guidelines
├── LICENSE                  # MIT License
└── .gitignore              # Git ignore rules
```

## Frontend (`/frontend`)

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── App.tsx         # Main app component
│   │   ├── App.css
│   │   ├── ChatInterface.tsx      # Main chat UI
│   │   ├── ChatInterface.css
│   │   ├── ChatInput.tsx          # Message input with voice
│   │   ├── ChatInput.css
│   │   ├── MessageList.tsx        # Message display
│   │   ├── MessageList.css
│   │   ├── MessageItem.tsx        # Individual message
│   │   ├── MessageItem.css
│   │   ├── Sidebar.tsx            # Conversation sidebar
│   │   ├── Sidebar.css
│   │   ├── Settings.tsx           # Settings modal
│   │   └── Settings.css
│   │
│   ├── services/           # Backend communication
│   │   └── backendService.ts     # WebSocket client
│   │
│   ├── store/              # State management
│   │   └── appStore.ts            # Zustand store
│   │
│   ├── types/              # TypeScript definitions
│   │   └── index.ts               # Type definitions
│   │
│   ├── test/               # Test utilities
│   │   └── setup.ts               # Test setup
│   │
│   ├── main.tsx            # React entry point
│   ├── index.css           # Global styles
│   └── vite-env.d.ts       # Vite types
│
├── public/                 # Static assets
│   └── icon.svg
│
├── index.html              # HTML template
├── package.json            # Frontend dependencies
├── tsconfig.json           # TypeScript config
├── tsconfig.node.json      # Node TypeScript config
├── vite.config.ts          # Vite configuration
└── .env.example            # Environment variables example
```

## Backend (`/backend`)

```
backend/
├── api/                    # API layer
│   ├── __init__.py
│   └── websocket_handler.py      # WebSocket message routing
│
├── services/               # Business logic
│   ├── __init__.py
│   ├── ollama_service.py         # Ollama API integration
│   └── action_service.py         # System actions
│
├── security/               # Security controls
│   ├── __init__.py
│   ├── sandbox.py                # Command validation
│   └── audit_logger.py           # Action logging
│
├── tests/                  # Unit tests
│   ├── __init__.py
│   ├── test_ollama_service.py
│   └── test_sandbox.py
│
├── main.py                 # FastAPI entry point
├── config.py               # Configuration management
├── requirements.txt        # Python dependencies
├── pytest.ini              # Pytest configuration
├── .env.example            # Environment variables example
└── venv/                   # Virtual environment (created during setup)
```

## Electron (`/electron`)

```
electron/
├── main.js                 # Main process (app lifecycle)
└── preload.js              # Preload script (secure IPC)
```

## Documentation (`/docs`)

```
docs/
├── ARCHITECTURE.md         # Architecture deep dive
├── SECURITY.md             # Security whitepaper
├── PLUGINS.md              # Plugin development guide
├── API.md                  # API reference
└── ALTERNATIVES.md         # Alternative architectures
```

## Scripts (`/scripts`)

```
scripts/
├── setup.sh                # Unix setup script
└── setup.ps1               # Windows setup script
```

## CI/CD (`.github/workflows`)

```
.github/
└── workflows/
    ├── ci.yml              # Continuous integration
    └── release.yml         # Release automation
```

## Build Output (`/dist`) - Generated

```
dist/                       # Created during build
├── JARVIS-Setup-1.0.0.exe # Windows installer
├── JARVIS-1.0.0.dmg       # macOS installer
├── JARVIS-1.0.0.AppImage  # Linux AppImage
├── JARVIS-1.0.0.deb       # Debian package
└── JARVIS-1.0.0.rpm       # RPM package
```

## User Data (`~/.jarvis`) - Created at Runtime

```
~/.jarvis/                  # User data directory
├── history.db              # Chat history (SQLite)
├── settings.json           # User settings
├── logs/                   # Audit logs
│   ├── audit_20241205.log
│   └── audit_20241206.log
└── plugins/                # User plugins
    ├── weather_plugin.py
    └── notes_plugin.py
```

## File Purposes

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Root npm configuration, Electron builder settings |
| `frontend/package.json` | Frontend dependencies and scripts |
| `backend/requirements.txt` | Python dependencies |
| `tsconfig.json` | TypeScript compiler options |
| `vite.config.ts` | Vite build configuration |
| `pytest.ini` | Pytest test configuration |
| `.env.example` | Environment variable templates |

### Entry Points

| File | Purpose |
|------|---------|
| `electron/main.js` | Electron app entry point |
| `frontend/src/main.tsx` | React app entry point |
| `backend/main.py` | FastAPI server entry point |

### Core Logic

| File | Purpose |
|------|---------|
| `frontend/src/store/appStore.ts` | Global state management |
| `frontend/src/services/backendService.ts` | Backend communication |
| `backend/services/ollama_service.py` | Ollama API integration |
| `backend/services/action_service.py` | System action execution |
| `backend/security/sandbox.py` | Security validation |

### UI Components

| File | Purpose |
|------|---------|
| `ChatInterface.tsx` | Main chat container |
| `ChatInput.tsx` | Message input with voice |
| `MessageList.tsx` | Message display container |
| `MessageItem.tsx` | Individual message rendering |
| `Sidebar.tsx` | Conversation list |
| `Settings.tsx` | Settings modal |

## File Size Estimates

### Source Code
- Frontend: ~50KB (TypeScript/React)
- Backend: ~30KB (Python)
- Electron: ~5KB (JavaScript)
- Documentation: ~100KB (Markdown)

### Dependencies
- `node_modules/`: ~300MB
- `backend/venv/`: ~100MB
- Frontend build: ~2MB

### Installers
- Windows: ~150-200MB
- macOS: ~150-200MB
- Linux: ~150-200MB

## Key Directories Explained

### `/frontend/src/components`
React UI components with associated styles. Each component is self-contained with its own CSS file.

### `/backend/services`
Business logic layer that handles Ollama communication, system actions, and other core functionality.

### `/backend/security`
Security controls including command sandboxing, audit logging, and encryption utilities.

### `/electron`
Electron main process that manages the app lifecycle, window creation, and Python backend process.

### `/docs`
Comprehensive documentation covering architecture, security, API reference, and plugin development.

## Development Workflow Files

### Hot Reload
- `vite.config.ts` - Enables fast refresh in development
- `electron/main.js` - Loads from localhost:5173 in dev mode

### Testing
- `frontend/src/test/setup.ts` - Test environment setup
- `backend/tests/` - Pytest test suite
- `pytest.ini` - Test configuration

### Building
- `package.json` (build section) - Electron builder configuration
- `scripts/` - Setup and build automation

## Important Paths

### Development
```bash
# Frontend dev server
http://localhost:5173

# Backend WebSocket
ws://127.0.0.1:8765/ws

# Ollama API
http://localhost:11434
```

### Production
```bash
# User data
~/.jarvis/

# Logs
~/.jarvis/logs/

# Plugins
~/.jarvis/plugins/
```

## File Naming Conventions

### Frontend
- Components: PascalCase (e.g., `ChatInterface.tsx`)
- Services: camelCase (e.g., `backendService.ts`)
- Styles: Match component name (e.g., `ChatInterface.css`)
- Types: camelCase (e.g., `index.ts`)

### Backend
- Modules: snake_case (e.g., `ollama_service.py`)
- Tests: `test_` prefix (e.g., `test_sandbox.py`)
- Config: snake_case (e.g., `config.py`)

### Documentation
- UPPERCASE for root docs (e.g., `README.md`)
- UPPERCASE for docs/ (e.g., `ARCHITECTURE.md`)

## Navigation Tips

### Finding Features

| Feature | Location |
|---------|----------|
| Chat UI | `frontend/src/components/ChatInterface.tsx` |
| Voice Input | `frontend/src/components/ChatInput.tsx` |
| Settings | `frontend/src/components/Settings.tsx` |
| Ollama Integration | `backend/services/ollama_service.py` |
| Security | `backend/security/` |
| Tests | `backend/tests/`, `frontend/src/test/` |
| Build Config | `package.json`, `electron-builder` section |
| CI/CD | `.github/workflows/` |

### Modifying Behavior

| What to Change | File to Edit |
|----------------|--------------|
| UI Layout | `frontend/src/components/*.tsx` |
| Styling | `frontend/src/components/*.css` |
| State Logic | `frontend/src/store/appStore.ts` |
| Backend API | `backend/api/websocket_handler.py` |
| Ollama Settings | `backend/config.py` |
| Security Rules | `backend/security/sandbox.py` |
| Build Settings | `package.json` |

## Clean Build

To start fresh:

```bash
# Remove all generated files
npm run clean

# Or manually:
rm -rf node_modules frontend/node_modules dist frontend/dist
rm -rf backend/venv backend/__pycache__ backend/.pytest_cache
```

## Backup Important Files

Before major changes, backup:
- `~/.jarvis/` (user data)
- `.env` files (if customized)
- Custom plugins in `~/.jarvis/plugins/`

---

This structure is designed for:
- ✅ Clear separation of concerns
- ✅ Easy navigation
- ✅ Scalability
- ✅ Maintainability
- ✅ Testing
- ✅ Documentation
