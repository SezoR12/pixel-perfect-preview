from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg2://tureep:tureep_dev@localhost:5432/tureep_db"
    REDIS_URL: str = "redis://localhost:6379/0"
    SECRET_KEY: str = "tureep-dev-secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    class Config:
        env_file = ".env"


settings = Settings()
