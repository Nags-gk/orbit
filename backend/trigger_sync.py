import asyncio
from app.database import SessionLocal
from app.models import User
from sqlalchemy import select
from app.services.credit_sync import sync_credit_card_bill

async def main():
    async with SessionLocal() as db:
        result = await db.execute(select(User))
        user = result.scalars().first()
        if user:
            print(f"Triggering sync for {user.email}...")
            await sync_credit_card_bill(db, user.id)
            print("Done!")
        else:
            print("No users found.")

if __name__ == "__main__":
    asyncio.run(main())
