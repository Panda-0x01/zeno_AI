import os
from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    # Ollama
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    DEFAULT_MODEL: str = "llama3.2:1b"  # Smaller model for low-end PCs
    MAX_CONTEXT_TOKENS: int = 2048  # Reduced for low-end PCs
    
    # Performance optimizations for low-end PCs
    LOW_MEMORY_MODE: bool = True
    MAX_CONCURRENT_REQUESTS: int = 1  # Reduced to 1 for very low-end PCs
    REQUEST_TIMEOUT: int = 60  # Increased timeout for slower processing
    ENABLE_RESPONSE_CACHING: bool = True
    CACHE_SIZE_MB: int = 32  # Reduced cache size
    STREAM_CHUNK_SIZE: int = 512  # Smaller chunks for better responsiveness
    
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
    
    # Database
    MYSQL_HOST: str = "localhost"
    MYSQL_PORT: int = 3306
    MYSQL_USER: str = "jarvis"
    MYSQL_PASSWORD: str = "jarvis123"
    MYSQL_DATABASE: str = "jarvis_db"
    
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
