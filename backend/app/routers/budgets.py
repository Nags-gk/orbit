"""
REST endpoints for budget goals.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date, timedelta
from ..database import get_db
from ..models import BudgetGoal, Transaction, TransactionType, User
from ..services.security import get_current_user

router = APIRouter(prefix="/api/budgets", tags=["budgets"])


class BudgetCreate(BaseModel):
    category: str
    monthlyLimit: float


class BudgetUpdate(BaseModel):
    monthlyLimit: float


@router.get("")
async def list_budgets(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all budget goals with current spending."""
    result = await db.execute(
        select(BudgetGoal)
        .where(BudgetGoal.user_id == current_user.id)
    )
    budgets = result.scalars().all()

    # Get current month spending by category
    today = date.today()
    month_start = today.replace(day=1)
    spending_result = await db.execute(
        select(Transaction.category, func.sum(Transaction.amount))
        .where(Transaction.user_id == current_user.id)
        .where(Transaction.type == TransactionType.expense)
        .where(Transaction.date >= month_start)
        .group_by(Transaction.category)
    )
    spending = {str(row[0].value if hasattr(row[0], 'value') else row[0]): row[1] for row in spending_result.all()}

    return [{
        **b.to_dict(),
        "spent": spending.get(b.category, 0),
        "remaining": max(0, b.monthly_limit - spending.get(b.category, 0)),
        "percentage": min(100, round((spending.get(b.category, 0) / b.monthly_limit) * 100)) if b.monthly_limit > 0 else 0,
    } for b in budgets]


@router.post("")
async def create_budget(
    body: BudgetCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new budget goal."""
    budget = BudgetGoal(
        category=body.category, 
        monthly_limit=body.monthlyLimit,
        user_id=current_user.id
    )
    db.add(budget)
    await db.commit()
    await db.refresh(budget)
    return budget.to_dict()


@router.put("/{budget_id}")
async def update_budget(
    budget_id: str, 
    body: BudgetUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a budget goal."""
    result = await db.execute(
        select(BudgetGoal)
        .where(BudgetGoal.id == budget_id)
        .where(BudgetGoal.user_id == current_user.id)
    )
    budget = result.scalar_one_or_none()
    if not budget:
        return {"error": "Budget not found"}
    budget.monthly_limit = body.monthlyLimit
    await db.commit()
    return budget.to_dict()


@router.delete("/{budget_id}")
async def delete_budget(
    budget_id: str, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a budget goal."""
    result = await db.execute(
        select(BudgetGoal)
        .where(BudgetGoal.id == budget_id)
        .where(BudgetGoal.user_id == current_user.id)
    )
    budget = result.scalar_one_or_none()
    if not budget:
        return {"error": "Budget not found"}
    await db.delete(budget)
    await db.commit()
    return {"ok": True}
