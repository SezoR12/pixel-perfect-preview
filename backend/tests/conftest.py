import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from sqlalchemy import create_engine, pool
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.database import Base, get_db
from app.main import app
from app.models import User, AccountType, Product, Demand, PreDeal
from app.security import hash_password, create_access_token

# Fully deterministic in-memory SQLite runner for pristine isolated execution
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=pool.StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session")
def test_db_engine():
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db(test_db_engine):
    connection = test_db_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    # Pre-seed deterministic testing actors
    u1 = User(
        email="buyer.turkey@tureep.ai",
        password_hash=hash_password("password123"),
        name="Istanbul Imports Ltd.",
        country="Turkey",
        account_type=AccountType.GOLD,
        is_verified=True,
    )
    u2 = User(
        email="seller.iraq@tureep.ai",
        password_hash=hash_password("password123"),
        name="Basra Dates Co.",
        country="Iraq",
        account_type=AccountType.SILVER,
        is_verified=True,
    )
    u3 = User(
        email="admin@tureep.ai",
        password_hash=hash_password("password123"),
        name="Tureep Compliance Admin",
        country="Turkey",
        account_type=AccountType.BLACK,
        is_verified=True,
    )
    session.add_all([u1, u2, u3])
    session.commit()
    
    p1 = Product(
        user_id=u2.id,
        name="Premium Iraqi Dates",
        category="dates",
        price="2.50",
        quantity=500,
        unit="ton",
        origin="Iraq",
        location="Basra",
        is_available=True,
    )
    session.add(p1)
    session.commit()
    
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def auth_headers(db):
    user = db.query(User).filter(User.email == "buyer.turkey@tureep.ai").first()
    token = create_access_token({"sub": user.id})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="function")
def seller_headers(db):
    user = db.query(User).filter(User.email == "seller.iraq@tureep.ai").first()
    token = create_access_token({"sub": user.id})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="function")
def admin_headers(db):
    user = db.query(User).filter(User.email == "admin@tureep.ai").first()
    token = create_access_token({"sub": user.id})
    return {"Authorization": f"Bearer {token}"}
