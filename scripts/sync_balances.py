import asyncio
import sys
import os

from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import select

# Setup path for backend
sys.path.append(os.path.abspath("./backend"))
from app.database import async_session
from app.models import Transaction, Account, User, TransactionType, AccountType

async def main():
    async with async_session() as db:
        # Get gptchat0428@gmail.com user
        user = (await db.execute(select(User).where(User.email == "gptchat0428@gmail.com"))).scalars().first()
        if not user:
            print("User not found.")
            return

        # Get their accounts
        accounts = (await db.execute(select(Account).where(Account.user_id == user.id))).scalars().all()

        for acc in accounts:
            # Get transactions for this account
            txs = (await db.execute(select(Transaction).where(Transaction.account_id == acc.id))).scalars().all()
            
            if not txs:
                if acc.balance != 0:
                    acc.balance = 0.0
                continue
            
            income = sum(t.amount for t in txs if t.type == TransactionType.income)
            expense = sum(t.amount for t in txs if t.type == TransactionType.expense)
            
            if acc.type in (AccountType.credit, AccountType.loan):
                # Debt increases on expense, decreases on income
                acc.balance = expense - income
            else:
                # Cash increases on income, decreases on expense
                acc.balance = income - expense
                
            print(f"Recalculated {acc.name}: {acc.balance}")

        await db.commit()
        print("Successfully synced all account balances with their transaction ledgers!")

if __name__ == "__main__":
    asyncio.run(main())
