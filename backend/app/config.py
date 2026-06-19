import os
from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres.bkwajecszulriwqivqnd:Tureep%23Enterprise2026%21Secured%2399xL@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
    )
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        "7e9d8f3a2c1b4e6a8b0d2f4c6e8a0b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c4e"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None

    # Sanctions API keys
    OFAC_API_KEY: Optional[str] = None
    DOW_JONES_API_KEY: Optional[str] = None
    
    # Deployment Security Overrides
    DEBUG: bool = os.getenv("DEBUG", "false").lower() in ("true", "1", "t")
    ALLOWED_ORIGINS: str = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:8080,http://localhost:3000,http://localhost:8000,https://tureep.ai,https://*.tureep.ai"
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
