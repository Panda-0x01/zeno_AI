import httpx
import json
from typing import List, Dict, Any, AsyncGenerator
from config import settings


class OllamaService:
    """Service for interacting with Ollama API"""
    
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.timeout = httpx.Timeout(120.0, connect=10.0)
    
    async def is_connected(self) -> bool:
        """Check if Ollama is accessible"""
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(10.0, connect=5.0)) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                return response.status_code == 200
        except Exception as e:
            print(f"[Ollama] Connection check failed: {e}")
            return False
    
    async def list_models(self) -> List[Dict[str, Any]]:
        """List available Ollama models"""
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(10.0, connect=5.0)) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                response.raise_for_status()
                data = response.json()
                return data.get("models", [])
        except Exception as e:
            raise Exception(f"Failed to list models: {str(e)}")
    
    async def chat_stream(
        self,
        messages: List[Dict[str, str]],
        model: str,
        temperature: float = 0.7,
    ) -> AsyncGenerator[str, None]:
        """Stream chat responses from Ollama"""
        try:
            payload = {
                "model": model,
                "messages": messages,
                "stream": True,
                "options": {
                    "temperature": temperature,
                    "num_ctx": settings.MAX_CONTEXT_TOKENS,
                },
            }
            print(f"[Ollama] Sending request to {self.base_url}/api/chat")
            print(f"[Ollama] Model: {model}, Messages: {len(messages)}")
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                async with client.stream(
                    "POST",
                    f"{self.base_url}/api/chat",
                    json=payload,
                ) as response:
                    if response.status_code != 200:
                        error_text = await response.aread()
                        print(f"[Ollama Error] Status: {response.status_code}, Body: {error_text.decode()}")
                        raise Exception(f"Ollama API error {response.status_code}: {error_text.decode()}")
                    
                    async for line in response.aiter_lines():
                        if line.strip():
                            try:
                                data = json.loads(line)
                                if "message" in data:
                                    content = data["message"].get("content", "")
                                    if content:
                                        yield content
                                
                                # Check if done
                                if data.get("done", False):
                                    break
                            
                            except Exception as e:
                                print(f"[Ollama] Error parsing line: {e}, Line: {line}")
                                continue
        
        except httpx.HTTPStatusError as e:
            error_msg = f"Ollama API error: {e.response.status_code}"
            print(f"[Ollama Error] {error_msg}")
            raise Exception(error_msg)
        except httpx.RequestError as e:
            error_msg = f"Connection error: {str(e)}"
            print(f"[Ollama Error] {error_msg}")
            raise Exception(error_msg)
        except Exception as e:
            error_msg = f"Chat error: {str(e)}"
            print(f"[Ollama Error] {error_msg}")
            raise Exception(error_msg)
    
    async def generate(
        self,
        prompt: str,
        model: str,
        temperature: float = 0.7,
    ) -> str:
        """Generate a single response (non-streaming)"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": temperature,
                            "num_ctx": settings.MAX_CONTEXT_TOKENS,
                        },
                    },
                )
                response.raise_for_status()
                data = response.json()
                return data.get("response", "")
        
        except Exception as e:
            raise Exception(f"Generate error: {str(e)}")
