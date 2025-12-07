# JARVIS Cheat Sheet

## 🚀 Quick Commands

### First Time Setup (Once)
```powershell
npm install
python -m venv backend/venv
backend\venv\Scripts\python.exe -m pip install -r backend/requirements.txt
```

### Run JARVIS (Every Time)
```powershell
npm run dev
```

### Stop JARVIS
- Close window or press `Ctrl+C`

---

## 🤖 Ollama (AI Engine)

### Install (Once)
1. Download: https://ollama.ai/download
2. Install it
3. Run: `ollama pull llama2`

### Check Status
```powershell
ollama list
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+J` | Toggle window |
| `Ctrl+K` | Focus chat |
| `Ctrl+,` | Settings |
| `Space` (hold) | Push-to-talk |
| `Esc` | Stop generation |

---

## 🔧 Troubleshooting

### Port in Use
```powershell
netstat -ano | findstr :8765
taskkill /PID <PID> /F
```

### Clean Restart
```powershell
npm run clean
npm install
npm run dev
```

### Check Ollama
```powershell
ollama serve
ollama list
```

---

## 📁 Important Files

- `HOW_TO_RUN.md` - Detailed run guide
- `RUN_COMMANDS.md` - All commands
- `CURRENT_STATUS.md` - Current state
- `README.md` - Full docs

---

## ✅ Status Check

```powershell
node --version          # Should be 18+
python --version        # Should be 3.10+
ollama --version        # Should be installed
Test-Path backend/venv  # Should be True
```

---

**Remember:** Setup once, then just `npm run dev` 🚀
