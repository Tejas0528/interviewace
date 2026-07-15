from pydantic_settings import BaseSettings
from typing import Optional, List

class Settings(BaseSettings):
    APP_NAME: str = "InterviewAce AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    SECRET_KEY: str = "change-this-in-production-very-secret-key-32chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # SQLite by default (no PostgreSQL needed!)
    DATABASE_URL: str = "sqlite+aiosqlite:///./interviewace.db"

    # AI
    GOOGLE_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None

    # File Upload
    UPLOAD_DIR: str = "/tmp/uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024

    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://frontend",
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
