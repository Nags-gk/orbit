import asyncio
import sys
import os
import itertools

from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import select, delete

# Setup path for backend
sys.path.append(os.path.abspath("./backend"))
from app.database import async_session
from app.models import Transaction, Account, User, TransactionType, AccountType

async def main():
    async with async_session() as db:
        user = (await db.execute(select(User).where(User.email == "gptchat0428@gmail.com"))).scalars().first()
        bofa_acc = (await db.execute(select(Account).where(Account.name == "Bofa"))).scalars().first()
        
        # 1. Delete my manual fix
        await db.execute(delete(Transaction).where(Transaction.id == 'fix-4-dollar'))
        
        # 2. Get all Bofa expenses to find duplicates
        txs = (await db.execute(select(Transaction).where(Transaction.account_id == bofa_acc.id, Transaction.type == TransactionType.expense))).scalars().all()
        
        # Group by amount to find exact matches
        amount_groups = {}
        for t in txs:
            amount_groups.setdefault(round(t.amount, 2), []).append(t)
            
        duplicates_to_delete = []
        for amount, group in amount_groups.items():
            if len(group) > 1:
                # We have multiple transactions with the exact same amount.
                # Let's keep the one that looks like a raw statement line (all caps, or has store numbers)
                # and delete the "friendly" named one (the manually added one).
                group.sort(key=lambda t: (t.description.isupper(), len(t.description))) # Prioritize keeping ALL CAPS or longer descriptions
                # pop the best one to keep
                best = group.pop(-1)
                print(f"Keeping: {best.description} ({best.amount})")
                for dup in group:
                    print(f"  Deleting Duplicate: {dup.description} ({dup.amount})")
                    duplicates_to_delete.append(dup.id)
                    
        # Extra check: Are there any Subway mismatches? (6.99 vs 7.62) -- maybe leave them unless confirmed.
        
        for tx_id in duplicates_to_delete:
            await db.execute(delete(Transaction).where(Transaction.id == tx_id))
            
        await db.commit()
        
        # 3. Recalculate Balance
        all_txs = (await db.execute(select(Transaction).where(Transaction.account_id == bofa_acc.id))).scalars().all()
        income = sum(t.amount for t in all_txs if t.type == TransactionType.income)
        expense = sum(t.amount for t in all_txs if t.type == TransactionType.expense)
        bofa_acc.balance = expense - income
        
        await db.commit()
        print(f"\nFinal Bofa Balance: {bofa_acc.balance}")

if __name__ == "__main__":
    asyncio.run(main())
