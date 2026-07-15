"""
Basic tests for InterviewAce API.
Run: pytest tests/ -v
"""
import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.main import app
from app.core.database import Base, get_db

# Use in-memory SQLite for tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
async def test_engine():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()

@pytest.fixture
async def test_db(test_engine):
    TestSession = async_sessionmaker(test_engine, expire_on_commit=False)
    async with TestSession() as session:
        yield session

@pytest.fixture
async def client(test_db):
    async def override_get_db():
        yield test_db

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


# ── Auth Tests ──────────────────────────────────────────────────────────────

class TestAuth:
    async def test_signup(self, client):
        res = await client.post("/api/v1/auth/signup", json={
            "email": "test@example.com",
            "password": "Test@12345",
            "full_name": "Test User",
        })
        assert res.status_code == 201
        data = res.json()
        assert data["email"] == "test@example.com"
        assert "id" in data

    async def test_signup_duplicate(self, client):
        payload = {"email": "dup@example.com", "password": "Test@12345", "full_name": "User"}
        await client.post("/api/v1/auth/signup", json=payload)
        res = await client.post("/api/v1/auth/signup", json=payload)
        assert res.status_code == 400

    async def test_login(self, client):
        # Create user first
        await client.post("/api/v1/auth/signup", json={
            "email": "login@example.com", "password": "Test@12345", "full_name": "Login User"
        })
        res = await client.post("/api/v1/auth/login", data={
            "username": "login@example.com", "password": "Test@12345"
        })
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert "refresh_token" in data

    async def test_login_wrong_password(self, client):
        await client.post("/api/v1/auth/signup", json={
            "email": "wp@example.com", "password": "Test@12345", "full_name": "WP User"
        })
        res = await client.post("/api/v1/auth/login", data={
            "username": "wp@example.com", "password": "WrongPass"
        })
        assert res.status_code == 401

    async def test_get_me(self, client):
        await client.post("/api/v1/auth/signup", json={
            "email": "me@example.com", "password": "Test@12345", "full_name": "Me User"
        })
        login = await client.post("/api/v1/auth/login", data={
            "username": "me@example.com", "password": "Test@12345"
        })
        token = login.json()["access_token"]
        res = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200
        assert res.json()["email"] == "me@example.com"

    async def test_me_unauthorized(self, client):
        res = await client.get("/api/v1/auth/me")
        assert res.status_code == 401


# ── Health Tests ─────────────────────────────────────────────────────────────

class TestHealth:
    async def test_health(self, client):
        res = await client.get("/health")
        assert res.status_code == 200
        assert res.json()["status"] == "ok"

    async def test_root(self, client):
        res = await client.get("/")
        assert res.status_code == 200
        assert "name" in res.json()
