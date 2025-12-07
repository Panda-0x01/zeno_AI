# Debugging Steps

## Current Issue
Messages are timing out with "Ollama is not responding" error.

## What We Know
✅ Ollama IS running (verified with curl)
✅ Ollama HAS llama2 model installed
✅ Backend IS starting (WebSocket connects)
✅ Frontend CAN connect to backend

## What We Need to Check

### 1. Check Terminal Output
When you run `npm run dev`, look for these messages in the terminal:

```
[Electron] Python path: ...
[Electron] Python exists: true
[Python Backend] JARVIS Backend starting on 127.0.0.1:8765
[Python Backend] Server started
[Python Backend] Connected to Ollama (1 models available)
```

**If you DON'T see "Connected to Ollama"**, that's the problem.

### 2. When You Send a Message
After sending a message, look for:

```
[Python Backend] [CHAT] Received chat request - Model: llama2, Messages: 1
[Python Backend] [Ollama] Sending request to http://localhost:11434/api/chat
[Python Backend] [Ollama] Model: llama2, Messages: 1
```

**If you see an error after these lines**, copy the FULL error message.

### 3. Manual Backend Test
Stop the app (Ctrl+C) and run the backend manually:

```bash
backend\venv\Scripts\python.exe backend\main.py
```

You should see:
```
JARVIS Backend starting on 127.0.0.1:8765
Ollama URL: http://localhost:11434
Server started
Connected to Ollama (1 models available)
INFO:     Uvicorn running on http://127.0.0.1:8765
```

Then in another terminal, test with curl:
```bash
curl -X POST http://127.0.0.1:8765/health
```

Should return: `{"status":"healthy","ollama_connected":true}`

### 4. Test Ollama Directly
```bash
curl -X POST http://localhost:11434/api/chat -H "Content-Type: application/json" -d "{\"model\":\"llama2\",\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}],\"stream\":false}"
```

Should return a JSON response with Ollama's answer.

## Common Issues

### Issue: "Python exists: false"
**Fix:** Already fixed - Python path now includes .exe

### Issue: "ModuleNotFoundError: No module named 'pydantic_settings'"
**Fix:** Run: `backend\venv\Scripts\python.exe -m pip install -r backend\requirements.txt`

### Issue: "Port 8765 already in use"
**Fix:** Kill the old process:
```bash
netstat -ano | Select-String "8765"
Stop-Process -Id <PID> -Force
```

### Issue: "Port 5173 already in use"
**Fix:** Kill the old Vite process:
```bash
netstat -ano | Select-String "5173"
Stop-Process -Id <PID> -Force
```

## Next Steps

**PLEASE SHARE:**
1. The FULL terminal output when you run `npm run dev`
2. What happens in the terminal when you send a message
3. Any error messages you see

Without this information, I can't identify the exact problem!
