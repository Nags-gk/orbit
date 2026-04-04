"""
Router for recurring bills — auto-detection + manual CRUD.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any
from datetime import date

from ..database import get_db
from ..models import RecurringBill, User
from ..services.security import get_current_user
from ..services.bill_detector import detect_recurring_bills

router = APIRouter(prefix="/api/bills", tags=["bills"])


@router.get("")
async def get_bills(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all recurring bills for the user."""
    stmt = select(RecurringBill).where(
        RecurringBill.user_id == current_user.id
    ).order_by(RecurringBill.next_due_date)
    result = await db.execute(stmt)
    return [b.to_dict() for b in result.scalars().all()]


@router.post("/detect")
async def detect_bills(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Auto-detect recurring bills from transaction history."""
    detected = await detect_recurring_bills(db, current_user.id)

    # Save detected bills that don't already exist
    existing = await db.execute(
        select(RecurringBill).where(RecurringBill.user_id == current_user.id)
    )
    existing_names = {b.name.lower() for b in existing.scalars().all()}

    new_bills = []
    for bill in detected:
        if bill["name"].lower() not in existing_names:
            new_bill = RecurringBill(
                user_id=current_user.id,
                name=bill["name"],
                amount=bill["amount"],
                frequency=bill["frequency"],
                next_due_date=date.fromisoformat(bill["nextDueDate"]),
                category=bill["category"],
                auto_detected=True,
            )
            db.add(new_bill)
            new_bills.append(bill)

    if new_bills:
        await db.commit()

    return {"detected": detected, "newlyAdded": len(new_bills)}


@router.post("")
async def create_bill(
    bill_in: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Manually add a recurring bill."""
    new_bill = RecurringBill(
        user_id=current_user.id,
        name=bill_in.get("name", "New Bill"),
        amount=float(bill_in.get("amount", 0)),
        frequency=bill_in.get("frequency", "monthly"),
        next_due_date=date.fromisoformat(bill_in.get("nextDueDate", date.today().isoformat())),
        category=bill_in.get("category", "Subscription"),
        auto_detected=False,
    )
    db.add(new_bill)
    await db.commit()
    await db.refresh(new_bill)
    return new_bill.to_dict()


@router.delete("/{bill_id}")
async def delete_bill(
    bill_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a recurring bill."""
    stmt = select(RecurringBill).where(
        RecurringBill.id == bill_id, RecurringBill.user_id == current_user.id
    )
    result = await db.execute(stmt)
    bill = result.scalar_one_or_none()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    await db.delete(bill)
    await db.commit()
    return {"message": "Bill deleted"}


@router.get("/calendar")
async def get_bill_calendar(
    month: int = 0,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get bills organized by day for calendar view. month=0 is current, 1 is next, etc."""
    from datetime import timedelta, date
    import calendar
    from ..models import Account, AccountType

    today = date.today()
    if month == 0:
        target_year, target_month = today.year, today.month
    else:
        target_month = today.month + month
        target_year = today.year + (target_month - 1) // 12
        target_month = ((target_month - 1) % 12) + 1

    _, days_in_month = calendar.monthrange(target_year, target_month)
    start = date(target_year, target_month, 1)
    end = date(target_year, target_month, days_in_month)

    # 1. Get Static Recurring Bills
    stmt = select(RecurringBill).where(RecurringBill.user_id == current_user.id)
    result = await db.execute(stmt)
    bills = result.scalars().all()
    
    # 2. Get Live Credit Card / Loan Balances
    acc_stmt = select(Account).where(Account.user_id == current_user.id)
    acc_result = await db.execute(acc_stmt)
    accounts = acc_result.scalars().all()
    
    credit_accounts = {a.name: a for a in accounts if a.type in (AccountType.credit, AccountType.loan) and a.balance > 0}

    # Map bills to their due dates within this month
    calendar_data = []
    gap_days = {"monthly": 30, "weekly": 7, "biweekly": 14, "yearly": 365}

    processed_credit_names = set()

    for bill in bills:
        due = bill.next_due_date
        gap = gap_days.get(bill.frequency, 30)
        
        amount = bill.amount
        name = bill.name
        
        # Link Custom Due Date to Live Balance if names match!
        if name in credit_accounts:
            amount = credit_accounts[name].balance
            processed_credit_names.add(name)

        # Find all occurrences of this bill within the target month
        while due < start:
            due += timedelta(days=gap)
        while due <= end:
            calendar_data.append({
                **bill.to_dict(),
                "name": name,
                "amount": amount,
                "dueDate": due.isoformat(),
            })
            due += timedelta(days=gap)
            
    # 3. Add Virtual Bills for un-linked Credit Cards (default due date 15th)
    for name, acc in credit_accounts.items():
        if name not in processed_credit_names:
            due_day = min(15, days_in_month) # fallback to 15th
            due_date = date(target_year, target_month, due_day)
            
            calendar_data.append({
                "id": f"virtual-{acc.id}",
                "name": f"{name} Payment",
                "amount": acc.balance,
                "dueDate": due_date.isoformat(),
                "frequency": "monthly",
                "category": "Utilities", # or something distinct
                "auto_detected": True
            })

    calendar_data.sort(key=lambda x: x["dueDate"])
    return {
        "year": target_year,
        "month": target_month,
        "bills": calendar_data,
        "totalDue": sum(b["amount"] for b in calendar_data),
    }

