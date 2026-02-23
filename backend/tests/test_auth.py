import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from api.main import app
from models.database import Base, get_db

# In-memory SQLite for tests
TEST_DATABASE_URL = "sqlite:///./test_veritas.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    """Create tables before each test, drop after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)

REGISTER_URL = "/auth/register"
LOGIN_URL = "/auth/login"
ME_URL = "/auth/me"

TEST_USER = {
    "email": "testuser@veritas.ai",
    "password": "securepassword123",
    "role": "associate",
}


def _register_and_login():
    """Helper: register a user and return the access token."""
    client.post(REGISTER_URL, json=TEST_USER)
    resp = client.post(LOGIN_URL, data={"username": TEST_USER["email"], "password": TEST_USER["password"]})
    return resp.json()["access_token"]


# ---------- Registration Tests ----------

def test_register_success():
    resp = client.post(REGISTER_URL, json=TEST_USER)
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == TEST_USER["email"]
    assert data["role"] == TEST_USER["role"]
    assert "id" in data
    assert "hashed_password" not in data  # must not leak


def test_register_duplicate_email():
    client.post(REGISTER_URL, json=TEST_USER)
    resp = client.post(REGISTER_URL, json=TEST_USER)
    assert resp.status_code == 400
    assert "already registered" in resp.json()["detail"].lower()


# ---------- Login Tests ----------

def test_login_success():
    client.post(REGISTER_URL, json=TEST_USER)
    resp = client.post(LOGIN_URL, data={"username": TEST_USER["email"], "password": TEST_USER["password"]})
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password():
    client.post(REGISTER_URL, json=TEST_USER)
    resp = client.post(LOGIN_URL, data={"username": TEST_USER["email"], "password": "wrongpassword"})
    assert resp.status_code == 401


def test_login_nonexistent_user():
    resp = client.post(LOGIN_URL, data={"username": "nobody@veritas.ai", "password": "whatever"})
    assert resp.status_code == 401


# ---------- /auth/me Tests ----------

def test_me_authenticated():
    token = _register_and_login()
    resp = client.get(ME_URL, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == TEST_USER["email"]
    assert data["role"] == TEST_USER["role"]


def test_me_no_token():
    resp = client.get(ME_URL)
    assert resp.status_code == 401


def test_me_invalid_token():
    resp = client.get(ME_URL, headers={"Authorization": "Bearer invalidtoken123"})
    assert resp.status_code == 401
