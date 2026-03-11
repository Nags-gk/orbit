import asyncio
from sqlalchemy import select
from app.database import async_session
from app.models import User, Account, AccountType
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_accounts():
    async with async_session() as db:
        email = "test500@test.com"
        user = (await db.execute(select(User).where(User.email == email))).scalars().first()
        if not user:
            hashed_pw = pwd_context.hash("password123")
            user = User(email=email, hashed_password=hashed_pw, full_name="Test User 500")
            db.add(user)
            await db.commit()
            await db.refresh(user)
            print("Created user:", user.email)

        # Clear existing accounts for idempotency
        existing_accounts = (await db.execute(select(Account).where(Account.user_id == user.id))).scalars().all()
        for acc in existing_accounts:
            await db.delete(acc)
        await db.commit()

        print(f"Adding accounts for user: {user.email}")
        accounts = [
            Account(user_id=user.id, name="Chase Sapphire Reserve", type=AccountType.credit, subtype="Credit Card", balance=1450.23),
            Account(user_id=user.id, name="Bank of America Checking", type=AccountType.depository, subtype="Checking", balance=3500.00),
            Account(user_id=user.id, name="Fidelity 401(k)", type=AccountType.investment, subtype="401k", balance=102500.75),
            Account(user_id=user.id, name="Robinhood Portfolio", type=AccountType.investment, subtype="Stock", balance=8450.50),
        ]
        db.add_all(accounts)
        await db.commit()
        print("Successfully seeded sample accounts")

if __name__ == "__main__":
    asyncio.run(seed_accounts())
