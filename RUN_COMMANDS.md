# JARVIS - All Commands to Run Project

Complete command reference for setting up and running JARVIS on Windows.

---

## 🚀 Quick Start (Copy & Paste)

### First Time Setup

```powershell
# 1. Install root dependencies
npm install

# 2. Install frontend dependencies
cd frontend
npm install
cd ..

# 3. Create Python virtual environment
python -m venv backend/venv

# 4. Install Python dependencies
backend\venv\Scripts\python.exe -m pip install --upgrade pip
backend\venv\Scripts\python.exe -m pip install -r backend/requirements.txt

# 5. Create environment files
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env

# 6. Generate secure token (optional - auto-generated)
# Token is already in .env file
```

### Run the Application

```powershell
# Single command to run everything
npm run dev
```

That's it! The app will open automatically.

---

## 📋 Detailed Commands

### Prerequisites Check

```powershell
# Check Node.js (need 18+)
node --version

# Check Python (need 3.10+)
python --version

# Check Ollama (optional but recommended)
ollama --version
```

### Installation Commands

#### 1. Root Dependencies
```powershell
npm install
```

#### 2. Frontend Dependencies
```powershell
cd frontend
npm install
cd ..
```

#### 3. Python Virtual Environment
```powershell
# Create venv
python -m venv backend/venv

# Activate venv (if needed manually)
backend\venv\Scripts\Activate.ps1

# Upgrade pip
backend\venv\Scripts\python.exe -m pip install --upgrade pip

# Install dependencies
backend\venv\Scripts\python.exe -m pip install -r backend/requirements.txt

# Deactivate (when done)
deactivate
```

#### 4. Environment Files
```powershell
# Copy example files
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env

# Generate secure token (optional)
$token = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
(Get-Content backend\.env) -replace 'WS_SECRET_TOKEN=', "WS_SECRET_TOKEN=$token" | Set-Content backend\.env
```

### Running the Application

#### Development Mode (Recommended)
```powershell
# Run everything (frontend + backend + electron)
npm run dev
```

This single command starts:
- Vite dev server (frontend) on http://localhost:5173
- Python FastAPI backend on http://127.0.0.1:8765
- Electron desktop app

#### Run Components Separately (Advanced)

**Terminal 1 - Backend:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python main.py
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

**Terminal 3 - Electron:**
```powershell
npm run dev:electron
```

### Ollama Setup (Required for AI)

```powershell
# Check if Ollama is installed
ollama --version

# If not installed, download from: https://ollama.ai/download

# Start Ollama service
ollama serve

# Pull a model (in new terminal)
ollama pull llama2

# Or try other models:
ollama pull mistral
ollama pull codellama
ollama pull mixtral

# List installed models
ollama list

# Test Ollama
ollama run llama2
# Type a message, then Ctrl+D to exit
```

### Building for Production

```powershell
# Build frontend
npm run build:frontend

# Build for current platform
npm run build

# Build for specific platforms
npm run build:win      # Windows installer
npm run build:mac      # macOS (requires macOS)
npm run build:linux    # Linux (requires Linux)

# Build for all platforms
npm run build:all
```

Output will be in `dist/` folder.

### Testing

```powershell
# Run all tests
npm test

# Frontend tests only
cd frontend
npm test

# Backend tests only
cd backend
.\venv\Scripts\Activate.ps1
pytest

# Run tests with coverage
cd backend
pytest --cov
```

### Linting

```powershell
# Lint all code
npm run lint

# Lint frontend only
cd frontend
npm run lint

# Lint backend (install flake8 first)
pip install flake8
cd backend
flake8 .
```

### Cleaning

```powershell
# Clean all build artifacts
npm run clean

# Manual cleanup
Remove-Item -Recurse -Force node_modules, frontend/node_modules, dist, frontend/dist, backend/venv, backend/__pycache__
```

---

## 🎯 Common Workflows

### Daily Development

```powershell
# 1. Start Ollama (if not running)
ollama serve

# 2. Start JARVIS
npm run dev

# 3. Make changes (hot reload enabled)
# 4. Test in the Electron window
# 5. Stop with Ctrl+C
```

### After Pulling New Code

```powershell
# Update dependencies
npm install
cd frontend && npm install && cd ..
backend\venv\Scripts\python.exe -m pip install -r backend/requirements.txt

# Restart app
npm run dev
```

### Creating a Release

```powershell
# 1. Update version in package.json
# 2. Build
npm run build

# 3. Test the installer in dist/
# 4. Create git tag
git tag v1.0.0
git push origin v1.0.0

# 5. GitHub Actions will create release automatically
```

---

## 🔧 Troubleshooting Commands

### Port Already in Use

```powershell
# Check what's using port 8765
netstat -ano | findstr :8765

# Kill process by PID (replace 1234 with actual PID)
taskkill /PID 1234 /F

# Or change port in backend/.env
# BACKEND_PORT=8766
```

### Python Issues

```powershell
# Recreate virtual environment
Remove-Item -Recurse -Force backend/venv
python -m venv backend/venv
backend\venv\Scripts\python.exe -m pip install -r backend/requirements.txt

# Check Python path
where python

# Check installed packages
backend\venv\Scripts\pip.exe list
```

### Node Issues

```powershell
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
Remove-Item -Recurse -Force node_modules, frontend/node_modules
npm install
cd frontend && npm install && cd ..

# Check Node version
node --version
npm --version
```

### Electron Issues

```powershell
# Rebuild Electron
npm run clean
npm install

# Clear Electron cache
Remove-Item -Recurse -Force $env:APPDATA\Electron
```

### Ollama Issues

```powershell
# Check Ollama status
ollama list

# Restart Ollama
# Close Ollama from system tray
# Start again: ollama serve

# Check Ollama API
curl http://localhost:11434/api/tags

# Or in PowerShell
Invoke-WebRequest -Uri http://localhost:11434/api/tags
```

---

## 📊 Process Management

### Check Running Processes

```powershell
# Check if JARVIS is running
Get-Process | Where-Object {$_.ProcessName -like "*electron*"}
Get-Process | Where-Object {$_.ProcessName -like "*python*"}

# Check ports
netstat -ano | findstr :5173  # Frontend
netstat -ano | findstr :8765  # Backend
netstat -ano | findstr :11434 # Ollama
```

### Stop All Processes

```powershell
# Stop Electron
Get-Process electron -ErrorAction SilentlyContinue | Stop-Process -Force

# Stop Python backend
Get-Process python -ErrorAction SilentlyContinue | Where-Object {$_.Path -like "*jarvis*"} | Stop-Process -Force

# Or just press Ctrl+C in the terminal running npm run dev
```

---

## 🎨 Development Commands

### Hot Reload

```powershell
# Frontend changes auto-reload (Vite)
# Just save files in frontend/src/

# Backend changes require restart
# Stop (Ctrl+C) and run: npm run dev
```

### Open Dev Tools

```powershell
# In Electron window, press F12
# Or add to electron/main.js:
# mainWindow.webContents.openDevTools()
```

### View Logs

```powershell
# Backend logs (in terminal)
# Or check: ~/.jarvis/logs/

# Frontend logs (in browser console)
# Press F12 in Electron window
```

---

## 📱 Platform-Specific Commands

### Windows

```powershell
# Run setup script
.\scripts\setup.ps1

# Set execution policy (if needed)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### macOS/Linux

```bash
# Run setup script
chmod +x scripts/setup.sh
./scripts/setup.sh

# Run manually
npm install
cd frontend && npm install && cd ..
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..
npm run dev
```

---

## 🚦 Status Check Commands

### Quick Health Check

```powershell
# Check if everything is ready
node --version          # Should be 18+
python --version        # Should be 3.10+
ollama --version        # Should be installed
Test-Path backend/venv  # Should be True
Test-Path backend/.env  # Should be True
Test-Path frontend/.env # Should be True
```

### Full System Check

```powershell
# Run this to verify everything
Write-Host "Node.js: $(node --version)"
Write-Host "Python: $(python --version)"
Write-Host "Ollama: $(ollama --version 2>&1)"
Write-Host "Backend venv: $(Test-Path backend/venv)"
Write-Host "Backend .env: $(Test-Path backend/.env)"
Write-Host "Frontend .env: $(Test-Path frontend/.env)"
Write-Host "Node modules: $(Test-Path node_modules)"
Write-Host "Frontend modules: $(Test-Path frontend/node_modules)"
```

---

## 📖 Documentation Commands

### View Documentation

```powershell
# Open in default browser
Start-Process README.md
Start-Process QUICK_START.md
Start-Process docs/ARCHITECTURE.md

# Or open in VS Code
code README.md
```

### Generate API Docs

```powershell
# Backend API docs (auto-generated by FastAPI)
# Start backend and visit: http://127.0.0.1:8765/docs
```

---

## 🎯 One-Line Commands

```powershell
# Complete setup from scratch
npm install; cd frontend; npm install; cd ..; python -m venv backend/venv; backend\venv\Scripts\python.exe -m pip install -r backend/requirements.txt; Copy-Item backend\.env.example backend\.env; Copy-Item frontend\.env.example frontend\.env

# Run application
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Clean everything
npm run clean
```

---

## 💡 Pro Tips

### Faster Development

```powershell
# Keep Ollama running in background
# Start once: ollama serve
# Then just: npm run dev

# Use VS Code tasks (create .vscode/tasks.json)
# Then: Ctrl+Shift+B to run
```

### Debugging

```powershell
# Backend debugging
# Add breakpoint in Python code
# Run: backend\venv\Scripts\python.exe -m debugpy --listen 5678 backend/main.py

# Frontend debugging
# Press F12 in Electron window
# Use React DevTools
```

### Performance

```powershell
# Check bundle size
cd frontend
npm run build
# Check dist/ folder size

# Analyze bundle
npm install -g webpack-bundle-analyzer
# Add to vite.config.ts
```

---

## 📞 Getting Help

```powershell
# Check logs
Get-Content backend/.env
Get-Content ~/.jarvis/logs/audit_*.log

# Test backend directly
Invoke-WebRequest -Uri http://127.0.0.1:8765/health

# Test Ollama
Invoke-WebRequest -Uri http://localhost:11434/api/tags
```

---

**Quick Reference:**
- **Setup**: `npm install` → `python -m venv backend/venv` → `backend\venv\Scripts\python.exe -m pip install -r backend/requirements.txt`
- **Run**: `npm run dev`
- **Build**: `npm run build`
- **Test**: `npm test`
- **Clean**: `npm run clean`

**Need Ollama?** https://ollama.ai/download → `ollama pull llama2`

---

*Last Updated: December 2024*
