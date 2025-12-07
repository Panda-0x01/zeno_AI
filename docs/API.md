# JARVIS API Reference

## WebSocket API

### Connection

**Endpoint**: `ws://127.0.0.1:8765/ws?token=<token>`

**Authentication**: Token-based (generated per session)

**Protocol**: JSON messages over WebSocket

### Message Format

All messages follow this structure:

```typescript
interface WSMessage {
  type: string;        // Message type
  data: any;          // Message payload
  requestId?: string; // Optional request ID for tracking
}
```

## Message Types

### 1. Chat

Send a chat message and receive streaming response.

**Request**:
```json
{
  "type": "chat",
  "requestId": "uuid-here",
  "data": {
    "messages": [
      {"role": "user", "content": "Hello"},
      {"role": "assistant", "content": "Hi there!"},
      {"role": "user", "content": "How are you?"}
    ],
    "model": "llama2",
    "temperature": 0.7
  }
}
```

**Response (Streaming)**:
```json
{
  "type": "stream",
  "requestId": "uuid-here",
  "data": {
    "chunk": "I'm doing",
    "done": false
  }
}
```

**Response (Complete)**:
```json
{
  "type": "stream",
  "requestId": "uuid-here",
  "data": {
    "done": true
  }
}
```

### 2. Models

List available Ollama models.

**Request**:
```json
{
  "type": "models",
  "requestId": "uuid-here",
  "data": {}
}
```

**Response**:
```json
{
  "type": "models",
  "requestId": "uuid-here",
  "data": {
    "models": [
      {
        "name": "llama2",
        "size": 3825819519,
        "modified_at": "2024-01-15T10:30:00Z",
        "digest": "sha256:..."
      }
    ]
  }
}
```

### 3. Action

Execute a system action.

**Request**:
```json
{
  "type": "action",
  "requestId": "uuid-here",
  "data": {
    "type": "shell",
    "command": "ls -la",
    "description": "List files in current directory"
  }
}
```

**Action Types**:
- `shell`: Execute shell command
- `file`: File operations (read/write)
- `app`: Launch application
- `notification`: Send desktop notification

**Response**:
```json
{
  "type": "action",
  "requestId": "uuid-here",
  "data": {
    "success": true,
    "output": "total 48\ndrwxr-xr-x  12 user  staff   384 Dec  5 10:30 .\n...",
    "error": null
  }
}
```

### 4. Settings

Update application settings.

**Request**:
```json
{
  "type": "settings",
  "requestId": "uuid-here",
  "data": {
    "model": "mistral",
    "temperature": 0.8,
    "maxTokens": 8192
  }
}
```

**Response**:
```json
{
  "type": "settings",
  "requestId": "uuid-here",
  "data": {
    "success": true
  }
}
```

### 5. Error

Error response for any failed operation.

**Response**:
```json
{
  "type": "error",
  "requestId": "uuid-here",
  "data": {
    "error": "Error message here"
  }
}
```

## HTTP Endpoints

### Health Check

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "healthy",
  "ollama_connected": true
}
```

## Ollama Integration

JARVIS communicates with Ollama's local API.

### Ollama Endpoints Used

#### List Models
```
GET http://localhost:11434/api/tags
```

#### Chat (Streaming)
```
POST http://localhost:11434/api/chat
Content-Type: application/json

{
  "model": "llama2",
  "messages": [
    {"role": "user", "content": "Hello"}
  ],
  "stream": true,
  "options": {
    "temperature": 0.7,
    "num_ctx": 4096
  }
}
```

#### Generate (Non-streaming)
```
POST http://localhost:11434/api/generate
Content-Type: application/json

{
  "model": "llama2",
  "prompt": "Hello",
  "stream": false,
  "options": {
    "temperature": 0.7
  }
}
```

## Frontend API (Electron)

Exposed via `window.electronAPI` in renderer process.

### Methods

#### getBackendConfig()
```typescript
const config = await window.electronAPI.getBackendConfig();
// Returns: { port: 8765, token: "secret-token" }
```

#### showSaveDialog(options)
```typescript
const result = await window.electronAPI.showSaveDialog({
  title: "Save File",
  defaultPath: "~/document.txt",
  filters: [
    { name: "Text Files", extensions: ["txt"] }
  ]
});
// Returns: { canceled: false, filePath: "/path/to/file.txt" }
```

#### showOpenDialog(options)
```typescript
const result = await window.electronAPI.showOpenDialog({
  title: "Open File",
  properties: ["openFile", "multiSelections"],
  filters: [
    { name: "All Files", extensions: ["*"] }
  ]
});
// Returns: { canceled: false, filePaths: ["/path/to/file.txt"] }
```

#### showMessageBox(options)
```typescript
const result = await window.electronAPI.showMessageBox({
  type: "question",
  title: "Confirm Action",
  message: "Are you sure?",
  buttons: ["Yes", "No"]
});
// Returns: { response: 0 } // Index of clicked button
```

### Events

#### onBackendConfig(callback)
```typescript
window.electronAPI.onBackendConfig((config) => {
  console.log("Backend config:", config);
});
```

#### onFocusChatInput(callback)
```typescript
window.electronAPI.onFocusChatInput(() => {
  // Focus chat input
});
```

#### onOpenSettings(callback)
```typescript
window.electronAPI.onOpenSettings(() => {
  // Open settings modal
});
```

## Error Codes

| Code | Description |
|------|-------------|
| 1000 | Normal closure |
| 1008 | Policy violation (invalid token) |
| 1011 | Internal server error |

## Rate Limiting

No rate limiting by default (local-only).

## Security

- All communication over localhost only
- Token-based authentication
- No CORS (local-only)
- Sandboxed command execution
- Audit logging enabled

## Examples

### Complete Chat Flow

```typescript
// 1. Connect to WebSocket
const ws = new WebSocket(`ws://127.0.0.1:8765/ws?token=${token}`);

// 2. Send chat message
ws.send(JSON.stringify({
  type: "chat",
  requestId: crypto.randomUUID(),
  data: {
    messages: [
      { role: "user", content: "What is 2+2?" }
    ],
    model: "llama2"
  }
}));

// 3. Receive streaming response
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === "stream") {
    if (message.data.done) {
      console.log("Response complete");
    } else {
      console.log("Chunk:", message.data.chunk);
    }
  }
};
```

### Execute Action

```typescript
ws.send(JSON.stringify({
  type: "action",
  requestId: crypto.randomUUID(),
  data: {
    type: "notification",
    command: "Reminder",
    description: "Time for a break!"
  }
}));
```

## Plugin API

See [PLUGINS.md](PLUGINS.md) for plugin development API.

## Versioning

API Version: 1.0.0

Breaking changes will increment major version.
