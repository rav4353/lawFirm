from pydantic_settings import BaseSettings
from pydantic import ConfigDict


class Settings(BaseSettings):
    SECRET_KEY: str = "veritas-dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DATABASE_URL: str = "sqlite:///./veritas.db"
    OPA_URL: str = "http://localhost:8181"
    
    # SendGrid Settings
    SENDGRID_API_KEY: str = "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"
    SENDGRID_FROM_EMAIL: str = "ravanthsri20@gmail.com"
    SENDGRID_FROM_NAME: str = "Veritas AI"

    model_config = ConfigDict(env_file=".env")


settings = Settings()
