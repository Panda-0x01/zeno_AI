import json
from typing import Any, Dict
from fastapi import WebSocket

from services.ollama_service import OllamaService
from services.action_service import ActionService
from services.database_service import DatabaseService
from security.audit_logger import AuditLogger


class WebSocketHandler:
    """Handles WebSocket messages and routes them to appropriate services"""
    
    def __init__(self, ollama_service: OllamaService, audit_logger: AuditLogger, db_service: DatabaseService = None):
        self.ollama_service = ollama_service
        self.action_service = ActionService(audit_logger)
        self.audit_logger = audit_logger
        self.db_service = db_service
    
    async def handle_connection(self, websocket: WebSocket):
        """Handle WebSocket connection lifecycle"""
        while True:
            # Receive message
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Route message
            await self.route_message(websocket, message)
    
    async def route_message(self, websocket: WebSocket, message: Dict[str, Any]):
        """Route message to appropriate handler"""
        msg_type = message.get("type")
        msg_data = message.get("data", {})
        request_id = message.get("requestId")
        
        try:
            if msg_type == "chat":
                await self.handle_chat(websocket, msg_data, request_id)
            elif msg_type == "models":
                await self.handle_models(websocket, request_id)
            elif msg_type == "action":
                await self.handle_action(websocket, msg_data, request_id)
            elif msg_type == "settings":
                await self.handle_settings(websocket, msg_data, request_id)
            elif msg_type == "save_conversation":
                await self.handle_save_conversation(websocket, msg_data, request_id)
            elif msg_type == "save_message":
                await self.handle_save_message(websocket, msg_data, request_id)
            elif msg_type == "load_conversations":
                await self.handle_load_conversations(websocket, request_id)
            elif msg_type == "load_messages":
                await self.handle_load_messages(websocket, msg_data, request_id)
            elif msg_type == "delete_conversation":
                await self.handle_delete_conversation(websocket, msg_data, request_id)
            else:
                await self.send_error(websocket, f"Unknown message type: {msg_type}", request_id)
        
        except Exception as e:
            await self.send_error(websocket, str(e), request_id)
    
    async def handle_chat(self, websocket: WebSocket, data: Dict[str, Any], request_id: str):
        """Handle chat message with streaming"""
        messages = data.get("messages", [])
        model = data.get("model", "llama2")
        
        print(f"[CHAT] Received chat request - Model: {model}, Messages: {len(messages)}")
        
        # Log request
        self.audit_logger.log_action("chat_request", {
            "model": model,
            "message_count": len(messages),
        })
        
        try:
            print(f"[CHAT] Starting stream from Ollama...")
            # Stream response
            chunk_count = 0
            async for chunk in self.ollama_service.chat_stream(messages, model):
                chunk_count += 1
                if chunk_count == 1:
                    print(f"[CHAT] First chunk received!")
                await websocket.send_json({
                    "type": "stream",
                    "data": {"chunk": chunk, "done": False},
                    "requestId": request_id,
                })
            
            print(f"[CHAT] Stream complete - {chunk_count} chunks sent")
            # Send completion
            await websocket.send_json({
                "type": "stream",
                "data": {"done": True},
                "requestId": request_id,
            })
        
        except Exception as e:
            print(f"[CHAT ERROR] {str(e)}")
            await self.send_error(websocket, f"Chat error: {str(e)}", request_id)
    
    async def handle_models(self, websocket: WebSocket, request_id: str):
        """Handle models list request"""
        try:
            models = await self.ollama_service.list_models()
            await websocket.send_json({
                "type": "models",
                "data": {"models": models},
                "requestId": request_id,
            })
        except Exception as e:
            await self.send_error(websocket, f"Models error: {str(e)}", request_id)
    
    async def handle_action(self, websocket: WebSocket, data: Dict[str, Any], request_id: str):
        """Handle action execution request"""
        action_type = data.get("type")
        command = data.get("command")
        description = data.get("description", "")
        
        # Log action request
        self.audit_logger.log_action("action_request", {
            "type": action_type,
            "command": command,
            "description": description,
        })
        
        try:
            result = await self.action_service.execute_action(
                action_type=action_type,
                command=command,
                description=description,
            )
            
            await websocket.send_json({
                "type": "action",
                "data": result,
                "requestId": request_id,
            })
        
        except Exception as e:
            await self.send_error(websocket, f"Action error: {str(e)}", request_id)
    
    async def handle_settings(self, websocket: WebSocket, data: Dict[str, Any], request_id: str):
        """Handle settings update"""
        # Log settings change
        self.audit_logger.log_action("settings_update", data)
        
        await websocket.send_json({
            "type": "settings",
            "data": {"success": True},
            "requestId": request_id,
        })
    
    async def handle_save_conversation(self, websocket: WebSocket, data: Dict[str, Any], request_id: str):
        """Save conversation to database"""
        if not self.db_service:
            await self.send_error(websocket, "Database not available", request_id)
            return
            
        conversation_id = data.get("id")
        title = data.get("title")
        model = data.get("model")
        
        success = self.db_service.save_conversation(conversation_id, title, model)
        await websocket.send_json({
            "type": "save_conversation",
            "data": {"success": success},
            "requestId": request_id,
        })
    
    async def handle_save_message(self, websocket: WebSocket, data: Dict[str, Any], request_id: str):
        """Save message to database"""
        if not self.db_service:
            await self.send_error(websocket, "Database not available", request_id)
            return
            
        message_id = data.get("id")
        conversation_id = data.get("conversationId")
        role = data.get("role")
        content = data.get("content")
        
        success = self.db_service.save_message(message_id, conversation_id, role, content)
        await websocket.send_json({
            "type": "save_message",
            "data": {"success": success},
            "requestId": request_id,
        })
    
    async def handle_load_conversations(self, websocket: WebSocket, request_id: str):
        """Load all conversations from database"""
        if not self.db_service:
            await self.send_error(websocket, "Database not available", request_id)
            return
            
        conversations = self.db_service.get_all_conversations()
        await websocket.send_json({
            "type": "load_conversations",
            "data": {"conversations": conversations},
            "requestId": request_id,
        })
    
    async def handle_load_messages(self, websocket: WebSocket, data: Dict[str, Any], request_id: str):
        """Load messages for a conversation from database"""
        if not self.db_service:
            await self.send_error(websocket, "Database not available", request_id)
            return
            
        conversation_id = data.get("conversationId")
        messages = self.db_service.get_conversation_messages(conversation_id)
        await websocket.send_json({
            "type": "load_messages",
            "data": {"messages": messages},
            "requestId": request_id,
        })
    
    async def handle_delete_conversation(self, websocket: WebSocket, data: Dict[str, Any], request_id: str):
        """Delete conversation from database"""
        if not self.db_service:
            await self.send_error(websocket, "Database not available", request_id)
            return
            
        conversation_id = data.get("conversationId")
        success = self.db_service.delete_conversation(conversation_id)
        await websocket.send_json({
            "type": "delete_conversation",
            "data": {"success": success},
            "requestId": request_id,
        })
    
    async def send_error(self, websocket: WebSocket, error: str, request_id: str = None):
        """Send error message"""
        await websocket.send_json({
            "type": "error",
            "data": {"error": error},
            "requestId": request_id,
        })
