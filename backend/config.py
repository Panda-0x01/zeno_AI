import os
from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    # Ollama
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    DEFAULT_MODEL: str = "llama2"
    MAX_CONTEXT_TOKENS: int = 4096
    
    # Server
    BACKEND_HOST: str = "127.0.0.1"
    BACKEND_PORT: int = 8765
    WS_SECRET_TOKEN: str = ""
    
    # Security
    ENABLE_ENCRYPTION: bool = True
    ENCRYPTION_PASSWORD: str = ""
    AUDIT_LOG_ENABLED: bool = True
    REQUIRE_ACTION_CONFIRMATION: bool = True
    
    # STT/TTS
    STT_ENGINE: str = "web"
    TTS_ENGINE: str = "web"
    WAKE_WORD_ENABLED: bool = False
    PORCUPINE_ACCESS_KEY: str = ""
    
    # Paths
    DATA_DIR: Path = Path.home() / ".jarvis"
    LOG_DIR: Path = Path.home() / ".jarvis" / "logs"
    PLUGINS_DIR: Path = Path.home() / ".jarvis" / "plugins"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Create directories
        self.DATA_DIR.mkdir(parents=True, exist_ok=True)
        self.LOG_DIR.mkdir(parents=True, exist_ok=True)
        self.PLUGINS_DIR.mkdir(parents=True, exist_ok=True)


settings = Settings()
