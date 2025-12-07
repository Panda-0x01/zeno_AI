# JARVIS Architecture

## Overview

JARVIS is a local-first AI desktop assistant built with a multi-tier architecture prioritizing security, privacy, and extensibility.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Electron Shell                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              React Frontend (Vite)                    │  │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────┐            │  │
│  │  │  Chat   │  │ Settings │  │  Voice   │            │  │
│  │  │   UI    │  │    UI    │  │   I/O    │            │  │
│  │  └─────────┘  └──────────┘  └──────────┘            │  │
│  └───────────────────────────────────────────────────────┘  │
│                          ↕                                   │
│              Secure IPC (WebSocket + Token)                  │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│              Python Backend (FastAPI)                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  WebSocket Handler                                    │  │
│  │  ├─ Message Router                                    │  │
│  │  ├─ Authentication                                    │  │
│  │  └─ Stream Manager                                    │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Services Layer                                       │  │
│  │  ├─ Ollama Service (Chat, Models)                    │  │
│  │  ├─ Action Service (Shell, Files, Apps)              │  │
│  │  ├─ STT Service (Whisper, VOSK)                      │  │
│  │  ├─ TTS Service (Coqui, pyttsx3)                     │  │
│  │  └─ Plugin Service (User Extensions)                 │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Security Layer                                       │  │
│  │  ├─ Sandbox (Command Validation)                     │  │
│  │  ├─ Audit Logger (Action Tracking)                   │  │
│  │  ├─ Encryption (AES-256-GCM)                         │  │
│  │  └─ Permission Manager                               │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                   Ollama (Local API)                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Model Management                                     │  │
│  │  ├─ Load/Unload Models                               │  │
│  │  ├─ Context Management                               │  │
│  │  └─ Inference Engine                                 │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend (React + TypeScript)

**Technology**: React 18, TypeScript, Vite, Zustand (state management)

**Responsibilities**:
- User interface rendering
- Voice input capture (Web Speech API)
- Text-to-speech playback
- WebSocket client for backend communication
- Local state management

**Key Features**:
- Accessible UI (ARIA labels, keyboard navigation)
- Light/dark theme support
- Responsive layout
- Real-time streaming message display

### Electron Shell

**Technology**: Electron 28

**Responsibilities**:
- Application lifecycle management
- Window management (main window, tray)
- Global keyboard shortcuts
- Python backend process management
- Secure IPC bridge (preload script)
- Native dialogs (file picker, confirmations)

**Security**:
- Context isolation enabled
- Node integration disabled
- Sandbox mode enabled
- Preload script for controlled API exposure

### Python Backend (FastAPI)

**Technology**: Python 3.10+, FastAPI, Uvicorn, WebSockets

**Responsibilities**:
- WebSocket server for real-time communication
- Ollama API integration
- System action execution
- Plugin management
- Security enforcement
- Audit logging

**API Endpoints**:
- `GET /health` - Health check
- `WS /ws?token=<token>` - WebSocket connection

**WebSocket Message Types**:
- `chat` - Send chat message, receive streaming response
- `models` - List available models
- `action` - Execute system action
- `settings` - Update settings

### Ollama Integration

**Communication**: HTTP REST API (localhost:11434)

**Operations**:
- `GET /api/tags` - List models
- `POST /api/chat` - Chat with streaming
- `POST /api/generate` - Single generation

**Features**:
- Streaming responses via Server-Sent Events
- Context window management
- Model parameter control (temperature, tokens)
- Error handling and retry logic

## Data Flow

### Chat Message Flow

1. User types message in React UI
2. Frontend sends via WebSocket: `{type: "chat", data: {messages, model}}`
3. Backend WebSocketHandler receives and routes to OllamaService
4. OllamaService streams response from Ollama API
5. Backend sends chunks: `{type: "stream", data: {chunk}}`
6. Frontend updates UI in real-time
7. Backend sends completion: `{type: "stream", data: {done: true}}`

### Action Execution Flow

1. AI suggests action (e.g., "run shell command")
2. Frontend prompts user for confirmation (if enabled)
3. User approves
4. Frontend sends: `{type: "action", data: {type, command}}`
5. Backend logs to audit log
6. ActionService validates via Sandbox
7. If safe, executes in controlled environment
8. Backend returns result: `{type: "action", data: {success, output}}`
9. Frontend displays result to user

## Security Architecture

### Threat Model

**Assumptions**:
- User's machine is trusted
- Local network is trusted
- Ollama is trusted
- User-installed plugins may be untrusted

**Threats**:
- Malicious plugin execution
- Command injection via AI responses
- Unauthorized file access
- Data exfiltration
- Privilege escalation

### Security Controls

1. **Network Isolation**
   - Backend binds to 127.0.0.1 only
   - WebSocket requires secret token
   - No external network access by default

2. **Command Sandboxing**
   - Whitelist of safe commands
   - Blacklist of dangerous patterns
   - Path validation for file operations
   - Timeout limits on execution

3. **User Confirmation**
   - All system actions require approval
   - Clear description of action intent
   - Audit log of all executions

4. **Data Encryption**
   - Optional AES-256-GCM for chat history
   - Password-derived keys (PBKDF2)
   - Encrypted at rest, decrypted in memory

5. **Audit Logging**
   - All actions logged with timestamps
   - Log rotation (30-day retention)
   - Tamper-evident log format

## Plugin System

### Plugin Structure

```python
# ~/.jarvis/plugins/example_plugin.py
from jarvis.plugin import Plugin, command

class ExamplePlugin(Plugin):
    name = "example"
    description = "Example plugin"
    
    @command(name="hello", description="Say hello")
    async def hello(self, name: str):
        return f"Hello, {name}!"
```

### Plugin Lifecycle

1. Discovery: Backend scans `~/.jarvis/plugins/`
2. Loading: Import and validate plugin
3. Registration: Register commands with router
4. Execution: Call command with parameters
5. Cleanup: Unload on shutdown

### Plugin Security

- Plugins run in same process (trust required)
- Future: Separate process with IPC
- User must explicitly enable plugins
- Audit log tracks plugin actions

## Alternative Architectures

### Tauri + Python

**Pros**:
- Smaller bundle size
- Rust security benefits
- Better performance

**Cons**:
- Less mature ecosystem
- More complex Python integration
- Limited documentation

### pywebview

**Pros**:
- Simpler architecture
- No Electron overhead
- Native webview

**Cons**:
- Limited features
- Platform inconsistencies
- No auto-update support

### Electron (Chosen)

**Pros**:
- Mature ecosystem
- Cross-platform consistency
- Rich feature set
- Easy Python integration

**Cons**:
- Larger bundle size
- Higher memory usage

## Performance Considerations

### Frontend

- Code splitting for faster initial load
- Virtual scrolling for long conversations
- Debounced input handling
- Lazy loading of settings

### Backend

- Async/await for non-blocking I/O
- Connection pooling for Ollama
- Streaming responses to reduce latency
- Efficient WebSocket message handling

### Ollama

- Model preloading for faster responses
- Context caching between requests
- GPU acceleration when available

## Deployment

### Development

```bash
# Terminal 1: Backend
cd backend && python main.py

# Terminal 2: Frontend + Electron
npm run dev
```

### Production

```bash
# Build frontend
cd frontend && npm run build

# Package with Electron Builder
npm run build:all
```

### Distribution

- **Windows**: NSIS installer (.exe)
- **macOS**: DMG with code signing
- **Linux**: AppImage, .deb, .rpm

## Future Enhancements

1. **Multi-modal Support**
   - Image input/output
   - Document parsing
   - Screen capture analysis

2. **Advanced Voice**
   - Custom wake word training
   - Voice cloning for TTS
   - Multi-language support

3. **Cloud Sync** (Optional)
   - End-to-end encrypted sync
   - Cross-device conversations
   - Backup and restore

4. **Team Features**
   - Shared plugins
   - Team knowledge base
   - Collaborative conversations
