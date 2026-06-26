# pyrefly: ignore [missing-import]
from pydantic_settings import BaseSettings
from typing import List
import os
from pathlib import Path

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Voice Assistant"
    API_V1_STR: str = "/api/v1"
    
    # Base directory
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/voice_agent")
    
    # AI Config
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    
    # Embedding Model
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    
    # Storage
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    AUDIO_DIR: Path = BASE_DIR / "audio"
    CHROMA_DB_PATH: str = str(BASE_DIR / "chroma_db")
    
    # OCR
    OCR_LANG: str = "en"
    
    # RAG
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-for-development")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:8080"]

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Ensure directories exist
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.AUDIO_DIR.mkdir(parents=True, exist_ok=True)
