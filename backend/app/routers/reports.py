"""
Reports router — export financial data as structured JSON for client-side PDF/CSV generation.
"""
from __future__ import annotations
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..models import Transaction, Account, TransactionType, TransactionCategory, AccountType, User
from ..services.security import get_current_user
from typing import Optional
from datetime import date, datetime, timedelta

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/export")
async def export_report(
    report_type: str = Query("monthly", description="monthly | tax | investment | full"),
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate structured report data for client-side PDF/CSV export.
    
    report_type options:
      - monthly: spending summary for a given month
      - tax: categorized expenses for tax reporting
      - investment: investment portfolio summary
      - full: comprehensive financial overview
    """
    today = date.today()
    
    # Parse date range
    start_date = None
    end_date = None
    if date_from:
        try:
            start_date = datetime.strptime(date_from, "%Y-%m-%d").date()
        except ValueError:
            pass
    if date_to:
        try:
            end_date = datetime.strptime(date_to, "%Y-%m-%d").date()
        except ValueError:
            pass
    
    if not start_date:
        start_date = today.replace(day=1)
    if not end_date:
        end_date = today

    # ── Fetch Transactions ──
    tx_query = (
        select(Transaction)
        .where(Transaction.user_id == current_user.id)
        .where(Transaction.date >= start_date)
        .where(Transaction.date <= end_date)
        .order_by(Transaction.date.desc())
    )
    result = await db.execute(tx_query)
    transactions = result.scalars().all()

    # ── Fetch Accounts ──
    acct_result = await db.execute(
        select(Account).where(Account.user_id == current_user.id)
    )
    accounts = acct_result.scalars().all()

    # ── Build transaction list ──
    tx_list = []
    total_income = 0.0
    total_expenses = 0.0
    category_totals = {}
    
    for tx in transactions:
        cat_val = tx.category.value if hasattr(tx.category, 'value') else str(tx.category)
        type_val = tx.type.value if hasattr(tx.type, 'value') else str(tx.type)
        amount = float(tx.amount)
        
        if type_val == "income":
            total_income += amount
        else:
            total_expenses += amount
            category_totals[cat_val] = category_totals.get(cat_val, 0) + amount
        
        tx_list.append({
            "date": tx.date.isoformat() if tx.date else "",
            "description": tx.description,
            "amount": amount,
            "category": cat_val,
            "type": type_val,
        })

    # ── Build account summary ──
    acct_list = []
    total_assets = 0.0
    total_liabilities = 0.0
    
    for acct in accounts:
        atype_val = acct.type.value if hasattr(acct.type, 'value') else str(acct.type)
        balance = float(acct.balance)
        
        if atype_val in ("credit", "loan"):
            total_liabilities += balance
        else:
            total_assets += balance
        
        acct_list.append({
            "name": acct.name,
            "type": atype_val,
            "subtype": acct.subtype or "",
            "balance": balance,
        })

    # ── Category breakdown sorted ──
    category_breakdown = [
        {"category": cat, "amount": round(amt, 2), "percent": round((amt / total_expenses * 100) if total_expenses > 0 else 0, 1)}
        for cat, amt in sorted(category_totals.items(), key=lambda x: x[1], reverse=True)
    ]

    report = {
        "reportType": report_type,
        "generatedAt": datetime.now().isoformat(),
        "dateRange": {"from": start_date.isoformat(), "to": end_date.isoformat()},
        "userName": current_user.email,
        "summary": {
            "totalTransactions": len(tx_list),
            "totalIncome": round(total_income, 2),
            "totalExpenses": round(total_expenses, 2),
            "netBalance": round(total_income - total_expenses, 2),
            "totalAssets": round(total_assets, 2),
            "totalLiabilities": round(total_liabilities, 2),
            "netWorth": round(total_assets - total_liabilities, 2),
        },
        "categoryBreakdown": category_breakdown,
        "transactions": tx_list,
        "accounts": acct_list,
    }

    return report
