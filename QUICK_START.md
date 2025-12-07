# JARVIS Quick Start Guide

Get up and running with JARVIS in 5 minutes!

## Prerequisites

Before you begin, install these required tools:

1. **Ollama** - [Download](https://ollama.ai/download)
2. **Node.js 18+** - [Download](https://nodejs.org/)
3. **Python 3.10+** - [Download](https://python.org/downloads/)

## Installation

### Option 1: Automated Setup (Recommended)

**macOS/Linux**:
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

**Windows** (PowerShell as Administrator):
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\scripts\setup.ps1
```

### Option 2: Manual Setup

```bash
# 1. Install dependencies
npm install
cd frontend && npm install && cd ..

# 2. Setup Python backend
cd backend
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate     # Windows

pip install -r requirements.txt
cd ..

# 3. Create environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

## Setup Ollama

```bash
# 1. Start Ollama service
ollama serve

# 2. Pull a model (in a new terminal)
ollama pull llama2

# Or try other models:
# ollama pull mistral
# ollama pull codellama
```

## Run JARVIS

### Development Mode

```bash
# Terminal 1: Start backend
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python main.py

# Terminal 2: Start frontend + Electron
npm run dev
```

The app will open automatically!

### Production Build

```bash
# Build for your platform
npm run build

# Find installer in dist/ folder
# Windows: JARVIS-Setup-1.0.0.exe
# macOS: JARVIS-1.0.0.dmg
# Linux: JARVIS-1.0.0.AppImage
```

## First Steps

1. **Start a Conversation**
   - Click "New Conversation" or press `Ctrl+Shift+J`
   - Type your message and press Enter

2. **Try Voice Input**
   - Click the microphone icon
   - Speak your message
   - Click again to stop

3. **Change Settings**
   - Click the settings icon (bottom left)
   - Select your preferred model
   - Adjust temperature and other options

4. **Use Keyboard Shortcuts**
   - `Ctrl+Shift+J` - Toggle window
   - `Ctrl+K` - Focus chat input
   - `Ctrl+,` - Open settings
   - `Space` (hold) - Push-to-talk
   - `Esc` - Stop generation

## Common Issues

### "Ollama connection failed"

**Solution**:
```bash
# Make sure Ollama is running
ollama serve

# Check if models are available
ollama list

# Pull a model if needed
ollama pull llama2
```

### "Backend won't start"

**Solution**:
```bash
# Check if port 8765 is available
netstat -an | findstr 8765  # Windows
lsof -i :8765               # macOS/Linux

# If port is in use, change it in backend/.env
BACKEND_PORT=8766
```

### "Python module not found"

**Solution**:
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate
pip install -r requirements.txt --upgrade
```

### "Electron build fails"

**Solution**:
```bash
# Clear cache and reinstall
npm run clean
rm -rf node_modules
npm install
```

## Example Conversations

### General Chat
```
You: Hello! What can you help me with?
JARVIS: I'm your local AI assistant. I can help with:
- Answering questions
- Writing and editing text
- Coding assistance
- System tasks (with your permission)
- And much more!
```

### Code Help
```
You: Write a Python function to calculate fibonacci numbers
JARVIS: Here's a Python function for fibonacci numbers:

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Or more efficient with memoization:
def fibonacci_memo(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fibonacci_memo(n-1, memo) + fibonacci_memo(n-2, memo)
    return memo[n]
```

### System Tasks
```
You: Create a file called notes.txt with "Hello World"
JARVIS: I can help with that. This will create a file in your Documents folder.
[Confirmation dialog appears]
[After approval]
JARVIS: ✅ File created successfully at ~/Documents/notes.txt
```

## Next Steps

- 📖 Read the [full README](README.md) for detailed documentation
- 🔐 Review [security settings](docs/SECURITY.md)
- 🔌 Learn about [plugins](docs/PLUGINS.md)
- 🏗️ Understand the [architecture](docs/ARCHITECTURE.md)

## Getting Help

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/your-repo/issues)
- 💬 **Questions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- 📧 **Security**: security@jarvis-project.example

## Tips & Tricks

### Improve Response Quality

1. **Use Better Models**:
   ```bash
   ollama pull llama2:13b  # Larger, more capable
   ollama pull mixtral     # High quality
   ```

2. **Adjust Temperature**:
   - Lower (0.3-0.5): More focused, deterministic
   - Higher (0.8-1.0): More creative, varied

3. **Provide Context**:
   - Include relevant information in your messages
   - Reference previous conversation points

### Optimize Performance

1. **Preload Models**:
   ```bash
   # Keep Ollama running with model loaded
   ollama run llama2
   # Press Ctrl+D to exit but keep model in memory
   ```

2. **Increase Context Window**:
   ```env
   # In backend/.env
   MAX_CONTEXT_TOKENS=8192  # For longer conversations
   ```

3. **Use GPU Acceleration**:
   - Ollama automatically uses GPU if available
   - Check with: `ollama ps`

### Customize Appearance

1. **Change Theme**: Settings → Appearance → Light/Dark
2. **Adjust Font Size**: Browser zoom (Ctrl +/-)
3. **Window Size**: Drag to resize, position is saved

## Recommended Models

| Model | Size | Best For | Speed |
|-------|------|----------|-------|
| llama2:7b | 3.8GB | General chat, fast responses | ⚡⚡⚡ |
| mistral:7b | 4.1GB | Balanced quality/speed | ⚡⚡⚡ |
| llama2:13b | 7.3GB | Better quality responses | ⚡⚡ |
| codellama:13b | 7.3GB | Code generation | ⚡⚡ |
| mixtral:8x7b | 26GB | Highest quality | ⚡ |

## Keyboard Shortcuts Reference

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+J` | Toggle main window |
| `Ctrl+K` | Focus chat input |
| `Ctrl+,` | Open settings |
| `Enter` | Send message |
| `Shift+Enter` | New line in message |
| `Space` (hold) | Push-to-talk |
| `Esc` | Stop generation |

## System Requirements

### Minimum
- **OS**: Windows 10, macOS 10.13, Ubuntu 18.04
- **RAM**: 8GB (for 7B models)
- **Disk**: 10GB free space
- **CPU**: 4 cores

### Recommended
- **OS**: Windows 11, macOS 12+, Ubuntu 22.04
- **RAM**: 16GB (for 13B models)
- **Disk**: 50GB free space (for multiple models)
- **GPU**: NVIDIA GPU with 8GB+ VRAM (optional)

## What's Next?

Now that you're up and running:

1. ✅ Explore different models
2. ✅ Try voice input/output
3. ✅ Customize settings
4. ✅ Create your first plugin
5. ✅ Join the community

Happy chatting! 🚀
