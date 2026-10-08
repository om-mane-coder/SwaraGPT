"""
SwaraGPT - Database Connection Manager
Provides asynchronous SQLAlchemy sessions for PostgreSQL with seamless,
automatic fallback to SQLite (aiosqlite) for frictionless local development.
Also provides a robust MongoDB client with SQLite/PostgreSQL JSON fallback.
"""
import os
import sys
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.config import settings


class Base(DeclarativeBase):
    pass


SQLITE_URL = f"sqlite+aiosqlite:///{settings.SQLITE_DB_PATH}"

# We lazily or proactively initialize the engine
engine = None
async_session = None
_is_sqlite_fallback = False
_initialized = False


async def init_db():
    """Attempt connecting to PostgreSQL; fallback cleanly to SQLite if unavailable."""
    global engine, async_session, _is_sqlite_fallback, _initialized
    if _initialized and engine is not None:
        return

    # Try PostgreSQL first if configured
    try_postgres = "postgresql" in settings.DATABASE_URL
    if try_postgres:
        try:
            test_engine = create_async_engine(settings.DATABASE_URL, echo=False)
            async with test_engine.connect() as conn:
                pass
            engine = test_engine
            async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
            _is_sqlite_fallback = False
            print(f" Connected to PostgreSQL database at {settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}")
            _initialized = True
            return
        except Exception as err:
            print(f"ℹ PostgreSQL not accessible ({err.__class__.__name__}). Activating resilient SQLite fallback: {settings.SQLITE_DB_PATH}")

    # Fallback to SQLite
    engine = create_async_engine(SQLITE_URL, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    _is_sqlite_fallback = True
    _initialized = True
def get_session_factory():
    """Return active session factory after ensuring engine is initialized."""
    global async_session
    if async_session is None:
        # Fallback instant init with SQLite
        e = create_async_engine(SQLITE_URL, echo=False)
        async_session = async_sessionmaker(e, class_=AsyncSession, expire_on_commit=False)
    return async_session


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency yielding an async database session."""
    if not _initialized:
        await init_db()
    factory = get_session_factory()
    async with factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# MongoDB Client with Resilience
mongo_client = None
mongo_db = None
_mongo_available = False


async def init_mongodb():
    """Initialize MongoDB connection if available, without crashing if absent."""
    global mongo_client, mongo_db, _mongo_available
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        client = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=1500)
        # Ping the server
        await client.admin.command('ping')
        mongo_client = client
        mongo_db = client[settings.MONGODB_DB]
        _mongo_available = True
        print(f" Connected to MongoDB at {settings.MONGODB_URL}")
    except Exception as e:
        _mongo_available = False
        print(f"ℹ MongoDB not detected ({e.__class__.__name__}). Using PostgreSQL/SQLite JSON repository fallback.")


def get_mongodb():
    """Return MongoDB handle if running, else None (triggers relational JSON fallback)."""
    return mongo_db if _mongo_available else None


async def create_all_tables():
    """Create all relational tables and run initial data seeding."""
    await init_db()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print(" Relational database schema synchronized successfully.")
