# Debug Instructions

## The Issue

Messages show "Thinking..." but never get a response, then show the Ollama error message.

## What We Know

✅ Ollama IS installed and running  
✅ Ollama IS responding (tested with Python)  
✅ Backend IS running  
✅ Frontend IS connected to backend (WebSocket open)  
❌ Messages are NOT reaching the backend

## Next Steps to Debug

### 1. Open Browser DevTools

In the Electron window:
1. Press **F12** to open DevTools
2. Click the **Console** tab
3. Send a test message: "Hello"
4. Look for these log messages:

```
[SEND] handleSendMessage called
[SEND] Sending message: Hello
```

### 2. Check What You See

**If you see `[SEND] Blocked - missing requirements`:**
- The frontend thinks something is missing
- Check what's false: backendService, currentConversation, or isGenerating

**If you DON'T see any `[SEND]` messages:**
- The send function isn't being called at all
- The input might be disabled
- Check if there's a button click handler issue

**If you see `[SEND] Sending message`:**
- The frontend IS trying to send
- Check the backend terminal for `[CHAT]` messages
- If no `[CHAT]` messages, the WebSocket isn't working

### 3. Share What You See

Tell me:
1. What console logs you see (copy/paste)
2. Any errors in red
3. What happens when you click Send

## Quick Test

Try this in the DevTools Console:

```javascript
// Check if backend service exists
console.log('Backend Service:', window.useAppStore?.getState?.()?.backendService);

// Check conversations
console.log('Conversations:', window.useAppStore?.getState?.()?.conversations);

// Check current conversation
console.log('Current:', window.useAppStore?.getState?.()?.currentConversationId);
```

## Expected Flow

```
1. User types message
2. User clicks Send
3. [SEND] handleSendMessage called ← Should see this
4. [SEND] Sending message ← Should see this
5. [CHAT] Received chat request ← Should see in terminal
6. [CHAT] Starting stream ← Should see in terminal
7. [CHAT] First chunk received ← Should see in terminal
8. Response appears in UI
```

## If Nothing Works

The issue is likely:
1. **Frontend not calling send** - Check DevTools console
2. **Backend not receiving** - Check terminal for [CHAT] logs
3. **Ollama not responding** - Already tested, this works
4. **WebSocket not sending** - Check Network tab in DevTools

---

**Open DevTools (F12) and send a message, then tell me what you see!**
