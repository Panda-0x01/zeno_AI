# How to Run JARVIS - Simple Guide

## 🆕 First Time Setup (Do This Once)

Run these commands in order:

```powershell
# 1. Install Node dependencies
npm install

# 2. Create Python virtual environment
python -m venv backend/venv

# 3. Install Python dependencies
backend\venv\Scripts\python.exe -m pip install -r backend/requirements.txt
```

**That's it for setup!** You only do this once.

---

## ▶️ Running the App (Every Time)

After the first-time setup, just run:

```powershell
npm run dev
```

**That's it!** This single command:
- ✅ Starts the frontend (React + Vite)
- ✅ Starts the backend (Python FastAPI)
- ✅ Opens the Electron window

---

## 🛑 Stopping the App

To stop JARVIS:
- **Option 1:** Close the Electron window
- **Option 2:** Press `Ctrl+C` in the terminal

---

## 🔄 Daily Workflow

### Starting Your Day:
```powershell
# Just run this:
npm run dev
```

### Working on Code:
- Make changes to files
- Frontend auto-reloads (hot reload)
- Backend requires restart (Ctrl+C, then `npm run dev`)

### Ending Your Day:
- Close the Electron window
- Or press `Ctrl+C`

---

## 🤖 Installing Ollama (Required for AI)

### First Time:
1. Download from: https://ollama.ai/download
2. Install it
3. Pull a model:
   ```powershell
   ollama pull llama2
   ```

### Every Time:
Ollama runs automatically in the background after installation.

If it's not running:
```powershell
ollama serve
```

---

## 📋 Complete Command Reference

### First Time Setup (Once):
```powershell
npm install
python -m venv backend/venv
backend\venv\Scripts\python.exe -m pip install -r backend/requirements.txt
```

### Run App (Every Time):
```powershell
npm run dev
```

### Install Ollama (Once):
```powershell
# After downloading from https://ollama.ai/download
ollama pull llama2
```

### Stop App:
- Close window or `Ctrl+C`

---

## ✅ Quick Checklist

### Before First Run:
- [ ] Node.js installed (18+)
- [ ] Python installed (3.10+)
- [ ] Ran `npm install`
- [ ] Created Python venv
- [ ] Installed Python packages

### Before Every Run:
- [ ] Ollama installed (for AI features)
- [ ] Ollama has a model (`ollama list`)

### To Run:
- [ ] Open terminal in project folder
- [ ] Run `npm run dev`
- [ ] Wait for Electron window to open

---

## 🎯 Summary

### First Time:
```powershell
npm install
python -m venv backend/venv
backend\venv\Scripts\python.exe -m pip install -r backend/requirements.txt
ollama pull llama2  # After installing Ollama
```

### Every Time After:
```powershell
npm run dev
```

**That's it!** 🚀

---

## 🔧 Troubleshooting

### If `npm run dev` fails:

**Check Node modules:**
```powershell
# If missing, reinstall:
npm install
cd frontend
npm install
cd ..
```

**Check Python venv:**
```powershell
# If missing, recreate:
python -m venv backend/venv
backend\venv\Scripts\python.exe -m pip install -r backend/requirements.txt
```

**Check Ollama:**
```powershell
# Verify it's installed:
ollama list

# If not working:
ollama serve
```

---

## 💡 Pro Tips

### Faster Startup:
Keep Ollama running in the background. It starts automatically after installation.

### Clean Restart:
If something is broken:
```powershell
# Stop everything
Ctrl+C

# Clean and reinstall
npm run clean
npm install
cd frontend && npm install && cd ..

# Run again
npm run dev
```

### Check if Running:
```powershell
# Check processes
Get-Process | Where-Object {$_.ProcessName -like "*electron*"}
Get-Process | Where-Object {$_.ProcessName -like "*python*"}
```

---

## 📞 Need Help?

See these files:
- `CURRENT_STATUS.md` - Current state and issues
- `RUN_COMMANDS.md` - All available commands
- `QUICK_START.md` - Detailed setup guide
- `README.md` - Full documentation

---

## 🎉 You're Ready!

**Setup once, run anytime with `npm run dev`**

Enjoy your AI assistant! 🤖
