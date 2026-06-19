from sqlalchemy import create_engine, pool
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

if settings.DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        settings.DATABASE_URL,
        future=True,
        connect_args={"check_same_thread": False},
        poolclass=pool.SingletonThreadPool,
    )
else:
    engine = create_engine(
        settings.DATABASE_URL,
        future=True,
        poolclass=pool.QueuePool,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,  # Verify connections before use
        pool_recycle=3600,   # Recycle connections after 1 hour
        echo=False,          # Set True only for debugging
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
