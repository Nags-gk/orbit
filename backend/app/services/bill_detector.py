"""
Bill Detection Service — scans transaction history to find recurring expenses.
Groups transactions by description similarity and detects monthly/weekly patterns.
"""
from collections import defaultdict
from datetime import date, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..models import Transaction, TransactionType


async def detect_recurring_bills(db: AsyncSession, user_id: str) -> list[dict]:
    """Analyze transactions to find recurring patterns."""
    result = await db.execute(
        select(Transaction)
        .where(Transaction.user_id == user_id)
        .where(Transaction.type == TransactionType.expense)
        .order_by(Transaction.date.desc())
    )
    transactions = result.scalars().all()

    # Group by normalized description
    groups: dict[str, list] = defaultdict(list)
    for tx in transactions:
        key = tx.description.strip().lower()
        groups[key].append(tx)

    detected = []
    for desc, txs in groups.items():
        if len(txs) < 2:
            continue

        # Check if amounts are consistent (within 10% tolerance)
        amounts = [tx.amount for tx in txs]
        avg_amount = sum(amounts) / len(amounts)
        consistent = all(abs(a - avg_amount) / avg_amount < 0.1 for a in amounts) if avg_amount > 0 else False

        if not consistent:
            continue

        # Detect frequency by analyzing date gaps
        dates = sorted([tx.date for tx in txs])
        if len(dates) >= 2:
            gaps = [(dates[i+1] - dates[i]).days for i in range(len(dates) - 1)]
            avg_gap = sum(gaps) / len(gaps)

            if 25 <= avg_gap <= 35:
                frequency = "monthly"
            elif 5 <= avg_gap <= 9:
                frequency = "weekly"
            elif 12 <= avg_gap <= 16:
                frequency = "biweekly"
            elif 350 <= avg_gap <= 380:
                frequency = "yearly"
            else:
                continue

            # Project next due date
            last_date = dates[-1]
            gap_days = {"monthly": 30, "weekly": 7, "biweekly": 14, "yearly": 365}
            next_due = last_date + timedelta(days=gap_days[frequency])

            # If next_due is in the past, advance it
            today = date.today()
            while next_due < today:
                next_due += timedelta(days=gap_days[frequency])

            detected.append({
                "name": txs[0].description,
                "amount": round(avg_amount, 2),
                "frequency": frequency,
                "nextDueDate": next_due.isoformat(),
                "category": txs[0].category.value if txs[0].category else "Other",
                "occurrences": len(txs),
            })

    # Sort by next due date
    detected.sort(key=lambda x: x["nextDueDate"])
    return detected
