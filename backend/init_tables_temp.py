import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from app.models import Base

async def init():
    # Use the same engine setup
    engine = create_async_engine(
        "sqlite+aiosqlite:///orbit.db",
        echo=True,
    )
    async with engine.begin() as conn:
        print("Running create_all...")
        await conn.run_sync(Base.metadata.create_all)
    print("Done!")

if __name__ == "__main__":
    asyncio.run(init())
