import asyncio
import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv

from api.websocket_handler import WebSocketHandler
from services.ollama_service import OllamaService
from services.database_service import DatabaseService
from security.audit_logger import AuditLogger
from config import settings

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Zeno Backend", version="1.0.0")

# CORS middleware (local only)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
ollama_service = OllamaService()
audit_logger = AuditLogger()
db_service = DatabaseService()
ws_handler = WebSocketHandler(ollama_service, audit_logger, db_service)


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    print(f"Zeno Backend starting on {settings.BACKEND_HOST}:{settings.BACKEND_PORT}")
    print(f"Ollama URL: {settings.OLLAMA_BASE_URL}")
    print("Server started")  # Signal to Electron that we're ready
    
    # Initialize database
    try:
        if db_service.connect():
            db_service.initialize_tables()
            print("[Database] Ready")
        else:
            print("[Database] Warning: Could not connect to MySQL")
            print("   Conversations will not be persisted")
    except Exception as e:
        print(f"[Database] Warning: {e}")
    
    # Test Ollama connection (non-blocking)
    try:
        is_connected = await ollama_service.is_connected()
        if is_connected:
            models = await ollama_service.list_models()
            print(f"Connected to Ollama ({len(models)} models available)")
        else:
            print("Warning: Could not connect to Ollama")
            print("   Make sure Ollama is running: ollama serve")
    except Exception as e:
        print(f"Warning: Ollama connection test failed: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("Shutting down Zeno Backend")
    if db_service:
        db_service.close()


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "ollama_connected": await ollama_service.is_connected(),
    }


@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query("", description="Authentication token")
):
    """WebSocket endpoint for real-time communication"""
    # Skip token validation in development mode
    # In production, you should enable this
    # expected_token = os.getenv("WS_SECRET_TOKEN", "")
    # if expected_token and token != expected_token:
    #     await websocket.close(code=1008, reason="Invalid token")
    #     return
    
    await websocket.accept()
    print(f"WebSocket client connected")
    
    try:
        await ws_handler.handle_connection(websocket)
    except WebSocketDisconnect:
        print("WebSocket client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close(code=1011, reason="Internal error")


def main():
    """Run the server"""
    host = os.getenv("BACKEND_HOST", "127.0.0.1")
    port = int(os.getenv("BACKEND_PORT", "8765"))
    
    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info",
        access_log=False,
    )


if __name__ == "__main__":
    main()
