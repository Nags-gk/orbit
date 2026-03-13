import asyncio
from app.database import async_session
from app.routers.transactions import get_summary
from app.models import User
from sqlalchemy import select

async def debug():
    async with async_session() as db:
        result = await db.execute(select(User).where(User.email == 'gptchat0428@gmail.com'))
        user = result.scalars().first()
        try:
            summary = await get_summary(db=db, current_user=user)
            print("SUCCESS! Summary is:", summary)
        except Exception as e:
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug())
