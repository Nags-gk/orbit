"""
Service to automatically synchronize outstanding credit card debt into the Calendar Bills list.
Triggers after any transaction modifies a credit card account.
"""
from datetime import date, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..models import Account, AccountType, RecurringBill

async def sync_credit_card_bill(db: AsyncSession, user_id: str):
    """
    Calculates total active credit card debt across all accounts and creates/updates
    a dynamic 'Credit Card Bill' scheduled for the 15th of the month.
    """
    try:
        # 1. Sum up all credit accounts to find active debt
        result = await db.execute(
            select(Account).where(Account.user_id == user_id, Account.type == AccountType.credit)
        )
        credit_accounts = result.scalars().all()
        
        total_debt = sum(a.balance for a in credit_accounts)
        
        # 2. Prevent negative/zero bills (no debt means nothing due)
        if total_debt <= 0:
            total_debt = 0.0

        # 3. Determine the correct 15th (due date)
        today = date.today()
        # If we are past the 15th, the bill falls to next month's 15th.
        # Otherwise, the bill is due THIS month's 15th.
        if today.day > 15:
            if today.month == 12:
                next_due = date(today.year + 1, 1, 15)
            else:
                next_due = date(today.year, today.month + 1, 15)
        else:
            next_due = date(today.year, today.month, 15)

        # 4. Find or create the Credit Card Bill entry
        bill_name = "Credit Card Bill"
        result = await db.execute(
            select(RecurringBill)
            .where(RecurringBill.user_id == user_id)
            .where(RecurringBill.name == bill_name)
        )
        bill = result.scalar_one_or_none()
        
        if bill:
            if total_debt <= 0:
                # If they paid it entirely off, we could either delete it or set it to 0
                bill.amount = 0.0
            else:
                bill.amount = total_debt
            bill.next_due_date = next_due
        elif total_debt > 0:
            bill = RecurringBill(
                user_id=user_id,
                name=bill_name,
                amount=total_debt,
                frequency="monthly",
                next_due_date=next_due,
                category="Credit Card",
                auto_detected=True
            )
            db.add(bill)
            
        await db.commit()
    except Exception as e:
        print(f"Failed to sync credit card bill: {e}")

