# Ollama Setup Guide - Fix "Thinking..." Issue

## The Problem

When you send a message, it gets stuck on "Thinking..." and never responds.

**Root Cause:** Ollama is not installed or not running.

---

## Solution: Install Ollama

### Step 1: Download Ollama

Visit: **https://ollama.ai/download**

Click "Download for Windows"

### Step 2: Install Ollama

1. Run the downloaded installer
2. Follow the installation wizard
3. Ollama will install and start automatically

### Step 3: Pull a Model

Open PowerShell or Command Prompt:

```powershell
# Pull the recommended model (4GB download)
ollama pull llama2

# Wait for download to complete
# You'll see: "success"
```

### Step 4: Verify Installation

```powershell
# Check if Ollama is running
ollama list

# You should see:
# NAME            ID              SIZE
# llama2:latest   ...             3.8 GB
```

### Step 5: Restart JARVIS

Close the Electron window and run:

```powershell
npm run dev
```

---

## What Changed in the Code

### 1. Removed Emojis (Windows Compatibility)

**Before:**
```tsx
{isUser ? '👤' : '🤖'}
```

**After:**
```tsx
{isUser ? (
  <svg>...</svg>  // User icon
) : (
  <svg>...</svg>  // Bot icon
)}
```

### 2. Added Timeout Detection

Now if Ollama doesn't respond within 10 seconds, you'll see:

```
⚠️ Ollama is not responding. Please make sure:

1. Ollama is installed (https://ollama.ai/download)
2. Ollama is running (run: ollama serve)
3. You have pulled a model (run: ollama pull llama2)

Then restart JARVIS.
```

### 3. Added Status Banner

When Ollama is not connected, you'll see a warning banner at the top:

```
⚠️ Ollama not connected. Install from ollama.ai and run: ollama pull llama2
```

---

## Testing Ollama

### Check if Ollama is Running

```powershell
# Method 1: List models
ollama list

# Method 2: Check API
curl http://localhost:11434/api/tags

# Method 3: PowerShell
Invoke-WebRequest -Uri http://localhost:11434/api/tags
```

### Start Ollama Manually (if needed)

```powershell
ollama serve
```

### Test Ollama Directly

```powershell
# Start interactive chat
ollama run llama2

# Type a message
# You: Hello

# Press Ctrl+D to exit
```

---

## Troubleshooting

### Issue: "ollama: command not found"

**Solution:** Ollama is not installed.
- Download from https://ollama.ai/download
- Install it
- Restart your terminal

### Issue: "No models available"

**Solution:** You haven't pulled a model yet.
```powershell
ollama pull llama2
```

### Issue: "Connection refused"

**Solution:** Ollama service is not running.
```powershell
ollama serve
```

### Issue: Still stuck on "Thinking..."

**Solution:** Check backend logs:
1. Look at the terminal running `npm run dev`
2. Check for errors in the `[Python Backend Error]` lines
3. Make sure you see: "Connected to Ollama (1 models available)"

---

## Alternative Models

If llama2 is too slow or large, try:

```powershell
# Smaller, faster model (1.5GB)
ollama pull phi

# Better quality (4GB)
ollama pull mistral

# For coding (7GB)
ollama pull codellama

# List all available models
ollama list
```

---

## Expected Behavior

### Before Ollama:
- ❌ Message stuck on "Thinking..."
- ❌ No response
- ❌ Warning banner shows

### After Ollama:
- ✅ Message sends
- ✅ Response streams in real-time
- ✅ No warning banner
- ✅ Model appears in settings dropdown

---

## Quick Fix Commands

```powershell
# Complete setup in one go:

# 1. Install Ollama from website first
# Then run:

ollama pull llama2
ollama list
npm run dev
```

---

## System Requirements

### For llama2:
- **RAM:** 8GB minimum (16GB recommended)
- **Disk:** 5GB free space
- **CPU:** Any modern processor
- **GPU:** Optional (speeds up responses)

### For smaller models (phi):
- **RAM:** 4GB minimum
- **Disk:** 2GB free space

---

## Performance Tips

### Faster Responses:
1. Use smaller models: `ollama pull phi`
2. Keep Ollama running in background
3. Use GPU if available (automatic)

### Better Quality:
1. Use larger models: `ollama pull llama2:13b`
2. Increase temperature in settings
3. Provide more context in messages

---

## Verification Checklist

Before using JARVIS, verify:

- [ ] Ollama installed
- [ ] Model pulled (`ollama list` shows models)
- [ ] Ollama running (`ollama serve` or auto-started)
- [ ] JARVIS restarted after Ollama install
- [ ] No warning banner in JARVIS
- [ ] Model appears in settings dropdown

---

## Still Having Issues?

### Check Backend Logs:

Look for these lines in the terminal:

**Good:**
```
Connected to Ollama (1 models available)
```

**Bad:**
```
Warning: Could not connect to Ollama
```

### Check Frontend:

1. Open DevTools (F12 in Electron window)
2. Go to Console tab
3. Look for errors

### Get Help:

1. Check `CURRENT_STATUS.md`
2. Check `RUN_COMMANDS.md`
3. Check `README.md`

---

## Summary

**The "Thinking..." issue is caused by Ollama not being installed.**

**Fix:**
1. Install Ollama: https://ollama.ai/download
2. Pull model: `ollama pull llama2`
3. Restart JARVIS: `npm run dev`

**That's it!** Your messages will now get responses. 🚀
