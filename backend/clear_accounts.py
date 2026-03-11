"""Clear all accounts so that the auto-seeder creates fresh defaults on next load."""
import asyncio
from sqlalchemy import select, delete
from app.database import async_session
from app.models import Account

async def clear():
    async with async_session() as db:
        await db.execute(delete(Account))
        await db.commit()
        print("All accounts cleared. Defaults will be auto-created on next Dashboard load.")

if __name__ == "__main__":
    asyncio.run(clear())
