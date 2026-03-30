"""
REST router for transactions and subscriptions.
Used by the frontend directly, separate from the AI chat pipeline.
"""
from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..models import Transaction, Subscription, User, TransactionType, TransactionCategory, Account, AccountType
from ..services.security import get_current_user
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from dateutil.relativedelta import relativedelta
from sqlalchemy import func
from pydantic import BaseModel
from fastapi import HTTPException

class TransactionCreate(BaseModel):
    description: str
    amount: float
    category: str
    type: str
    date: date
    account_id: Optional[str] = None

router = APIRouter(prefix="/api", tags=["data"])


from sqlalchemy.orm import joinedload

@router.get("/transactions")
async def list_transactions(
    account_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    stmt = select(Transaction).options(joinedload(Transaction.account)).where(Transaction.user_id == current_user.id)
    
    if account_type:
        stmt = stmt.join(Account).where(Account.type == account_type)
        
    result = await db.execute(stmt.order_by(Transaction.date.desc()).limit(150))
    transactions = result.scalars().all()
    
    output = []
    for tx in transactions:
        d = tx.to_dict()
        if tx.account:
            d["accountName"] = tx.account.name
            d["accountType"] = tx.account.type.value
        else:
            d["accountName"] = "Manual / Unlinked"
            d["accountType"] = "other"
        output.append(d)
        
    return output


@router.post("/transactions")
async def create_transaction(
    tx_data: TransactionCreate,
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    try:
        # Handle case-insensitive type
        tx_type_enum = TransactionType(tx_data.type.lower())
        
        # Handle case-insensitive category (try key first, then value)
        try:
            # Try by key (exact match)
            tx_cat_enum = getattr(TransactionCategory, tx_data.category)
        except AttributeError:
            try:
                # Try by value (exact match)
                tx_cat_enum = TransactionCategory(tx_data.category)
            except ValueError:
                # Try case-insensitive matching against values
                category_map = {c.value.lower(): c for c in TransactionCategory}
                if tx_data.category.lower() in category_map:
                    tx_cat_enum = category_map[tx_data.category.lower()]
                else:
                    raise ValueError(f"Invalid category: {tx_data.category}")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid transaction type or category")

    new_tx = Transaction(
        user_id=current_user.id,
        account_id=tx_data.account_id,
        description=tx_data.description,
        amount=tx_data.amount,
        category=tx_cat_enum,
        type=tx_type_enum,
        date=tx_data.date
    )
    db.add(new_tx)

    # Automatically Update Account Balance
    if tx_data.account_id:
        acc_result = await db.execute(
            select(Account).where(Account.id == tx_data.account_id, Account.user_id == current_user.id)
        )
        account = acc_result.scalars().first()
        if account:
            if tx_type_enum == TransactionType.expense:
                # Expenses INCREASE credit/loan debt, DECREASE checking/savings
                if account.type in (AccountType.credit, AccountType.loan):
                    account.balance += tx_data.amount
                else:
                    account.balance -= tx_data.amount
            elif tx_type_enum == TransactionType.income:
                # Income DECREASES credit/loan debt, INCREASES checking/savings
                if account.type in (AccountType.credit, AccountType.loan):
                    account.balance -= tx_data.amount
                else:
                    account.balance += tx_data.amount
            db.add(account)

    await db.commit()
    await db.refresh(new_tx)
    return new_tx.to_dict()

@router.put("/transactions/{transaction_id}")
async def update_transaction(
    transaction_id: str,
    tx_data: TransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Transaction)
        .where(Transaction.id == transaction_id)
        .where(Transaction.user_id == current_user.id)
    )
    tx = result.scalars().first()
    
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    try:
        tx_type_enum = TransactionType(tx_data.type)
        try:
            tx_cat_enum = getattr(TransactionCategory, tx_data.category)
        except AttributeError:
            tx_cat_enum = TransactionCategory(tx_data.category)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid transaction type or category")

    tx.description = tx_data.description
    tx.amount = tx_data.amount
    tx.category = tx_cat_enum
    tx.type = tx_type_enum
    tx.date = tx_data.date
    tx.account_id = tx_data.account_id

    await db.commit()
    await db.refresh(tx)
    return tx.to_dict()


@router.delete("/transactions/{transaction_id}")
async def delete_transaction(
    transaction_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Transaction)
        .where(Transaction.id == transaction_id)
        .where(Transaction.user_id == current_user.id)
    )
    tx = result.scalars().first()
    
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    await db.delete(tx)
    await db.commit()
    return {"message": "Transaction deleted successfully"}

@router.get("/subscriptions")
async def list_subscriptions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Subscription)
        .where(Subscription.user_id == current_user.id)
        .order_by(Subscription.name)
    )
    return [s.to_dict() for s in result.scalars().all()]

@router.get("/summary")
async def get_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Total Balance: Income - Expenses (all time)
    # Better approach for a banking app would be to sum all transactions.
    income_result = await db.execute(
        select(func.sum(Transaction.amount))
        .where(Transaction.user_id == current_user.id)
        .where(Transaction.type == TransactionType.income)
    )
    total_income = income_result.scalar() or 0.0

    expense_result = await db.execute(
        select(func.sum(Transaction.amount))
        .where(Transaction.user_id == current_user.id)
        .where(Transaction.type == TransactionType.expense)
    )
    total_expenses = expense_result.scalar() or 0.0
    
    total_balance = total_income - total_expenses

    # Monthly Spending: Expenses in the current month
    now = datetime.now()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    monthly_spending_result = await db.execute(
        select(func.sum(Transaction.amount))
        .where(Transaction.user_id == current_user.id)
        .where(Transaction.type == TransactionType.expense)
        .where(Transaction.date >= start_of_month.date())
    )
    monthly_spending = monthly_spending_result.scalar() or 0.0

    # Active Subscriptions
    subs_result = await db.execute(
        select(func.count(Subscription.id))
        .where(Subscription.user_id == current_user.id)
        .where(Subscription.active == True)
    )
    active_subscriptions = subs_result.scalar() or 0

    # Fetch all accounts to group balances
    accounts_result = await db.execute(
        select(Account)
        .where(Account.user_id == current_user.id)
    )
    accounts = accounts_result.scalars().all()
    
    depository_balance = sum(a.balance for a in accounts if a.type == AccountType.depository)
    credit_balance = sum(a.balance for a in accounts if a.type == AccountType.credit)
    investment_balance = sum(a.balance for a in accounts if a.type == AccountType.investment)
    loan_balance = sum(a.balance for a in accounts if a.type == AccountType.loan)

    return {
        "totalBalance": total_balance,
        "monthlySpending": monthly_spending,
        "activeSubscriptions": active_subscriptions,
        "savingsGoal": 5000.0, # This can be wired up to BudgetGoal later
        "accountsInfo": {
            "depository": depository_balance,
            "credit": credit_balance,
            "investment": investment_balance,
            "loan": loan_balance
        }
    }


class AutoCategorizeRequest(BaseModel):
    transaction_ids: Optional[list] = None  # If None, re-categorize all


@router.post("/transactions/auto-categorize")
async def bulk_auto_categorize(
    request: AutoCategorizeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Re-categorize transactions using the AI-powered categorizer."""
    from ..services.categorizer import auto_categorize

    query = select(Transaction).where(Transaction.user_id == current_user.id)
    if request.transaction_ids:
        query = query.where(Transaction.id.in_(request.transaction_ids))
    
    result = await db.execute(query)
    transactions = result.scalars().all()
    
    updated = []
    for tx in transactions:
        cat_result = auto_categorize(tx.description)
        new_cat = TransactionCategory(cat_result["category"])
        old_cat = tx.category
        
        if old_cat != new_cat:
            tx.category = new_cat
            updated.append({
                "id": tx.id,
                "description": tx.description,
                "oldCategory": old_cat.value if hasattr(old_cat, 'value') else old_cat,
                "newCategory": cat_result["category"],
                "confidence": cat_result["confidence"],
                "method": cat_result["method"],
            })
    
    await db.commit()
    
    return {
        "totalProcessed": len(transactions),
        "totalUpdated": len(updated),
        "updates": updated,
        "message": f"Re-categorized {len(updated)} of {len(transactions)} transactions.",
    }
