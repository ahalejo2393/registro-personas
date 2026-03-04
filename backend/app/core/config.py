from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/registro_db"
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    ADMIN_EMAIL: str = "admin@example.com"
    ADMIN_PASSWORD: str = "Admin123!"
    ADMIN_USERNAME: str = "admin"

    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASS: str = ""
    FROM_EMAIL: str = "noreply@example.com"
    FRONTEND_URL: str = "http://localhost:3000"

    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE_MB: int = 5
    CONSOLE_EMAIL_MODE: bool = True

    PASSWORD_RESET_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"

settings = Settings()
