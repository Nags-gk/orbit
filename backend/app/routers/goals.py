"""
Router for savings goals — CRUD + projected completion tracking.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any
from datetime import date, timedelta

from ..database import get_db
from ..models import SavingsGoal, Transaction, TransactionType, User
from ..services.security import get_current_user

router = APIRouter(prefix="/api/goals", tags=["goals"])


@router.get("")
async def get_goals(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all savings goals with projected completion dates."""
    stmt = select(SavingsGoal).where(SavingsGoal.user_id == current_user.id)
    result = await db.execute(stmt)
    goals = result.scalars().all()

    # Calculate monthly savings velocity from the last 3 months
    three_months_ago = date.today() - timedelta(days=90)
    income_result = await db.execute(
        select(func.sum(Transaction.amount))
        .where(Transaction.user_id == current_user.id)
        .where(Transaction.type == TransactionType.income)
        .where(Transaction.date >= three_months_ago)
    )
    expense_result = await db.execute(
        select(func.sum(Transaction.amount))
        .where(Transaction.user_id == current_user.id)
        .where(Transaction.type == TransactionType.expense)
        .where(Transaction.date >= three_months_ago)
    )
    total_income = income_result.scalar() or 0
    total_expense = expense_result.scalar() or 0
    monthly_savings = (total_income - total_expense) / 3 if total_income > total_expense else 0

    enriched_goals = []
    for goal in goals:
        data = goal.to_dict()
        remaining = goal.target_amount - goal.current_amount
        if monthly_savings > 0 and remaining > 0:
            months_needed = remaining / monthly_savings
            projected_date = date.today() + timedelta(days=int(months_needed * 30))
            data["projectedDate"] = projected_date.isoformat()
            data["monthsRemaining"] = round(months_needed, 1)
        else:
            data["projectedDate"] = None
            data["monthsRemaining"] = None
        data["monthlySavingsRate"] = round(monthly_savings, 2)
        enriched_goals.append(data)

    return enriched_goals


@router.post("")
async def create_goal(
    goal_in: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new savings goal."""
    new_goal = SavingsGoal(
        user_id=current_user.id,
        name=goal_in.get("name", "New Goal"),
        target_amount=float(goal_in.get("targetAmount", 1000)),
        current_amount=float(goal_in.get("currentAmount", 0)),
        deadline=date.fromisoformat(goal_in["deadline"]) if goal_in.get("deadline") else None,
        icon=goal_in.get("icon", "piggy-bank"),
    )
    db.add(new_goal)
    await db.commit()
    await db.refresh(new_goal)
    return new_goal.to_dict()


@router.patch("/{goal_id}")
async def update_goal(
    goal_id: str,
    updates: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a savings goal (add funds, change target, etc.)."""
    stmt = select(SavingsGoal).where(SavingsGoal.id == goal_id, SavingsGoal.user_id == current_user.id)
    result = await db.execute(stmt)
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    if "currentAmount" in updates:
        goal.current_amount = float(updates["currentAmount"])
    if "targetAmount" in updates:
        goal.target_amount = float(updates["targetAmount"])
    if "name" in updates:
        goal.name = updates["name"]
    if "addFunds" in updates:
        goal.current_amount += float(updates["addFunds"])

    db.add(goal)
    await db.commit()
    await db.refresh(goal)
    return goal.to_dict()


@router.delete("/{goal_id}")
async def delete_goal(
    goal_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a savings goal."""
    stmt = select(SavingsGoal).where(SavingsGoal.id == goal_id, SavingsGoal.user_id == current_user.id)
    result = await db.execute(stmt)
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    await db.delete(goal)
    await db.commit()
    return {"message": "Goal deleted"}
