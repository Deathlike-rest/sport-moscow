from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from config import settings

engine = create_async_engine(
    settings.database_url,
    pool_size=10,
    max_overflow=5,
    echo=False,
)

AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_session() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session


async def init_db() -> None:
    from storage.models import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Enable PostGIS
        await conn.execute(__import__("sqlalchemy").text("CREATE EXTENSION IF NOT EXISTS postgis"))
