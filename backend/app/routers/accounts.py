"""
Router for managing financial accounts and investments.

Every user gets 4 default account cards automatically:
  - Credit Card (credit)
  - Checking Account (depository)
  - 401(k) (investment / 401k)
  - Stocks (investment / Stock)

Users can rename accounts and update balances at any time.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any
from datetime import date

from ..database import get_db
from ..models import Account, AccountType, NetWorthSnapshot, User
from ..services.security import get_current_user
from ..services.credit_sync import sync_credit_card_bill

router = APIRouter(prefix="/api/accounts", tags=["accounts"])

# The 4 default account templates every user starts with
DEFAULT_ACCOUNTS = [
    {"name": "Credit Card",      "type": AccountType.credit,     "subtype": "Credit Card"},
    {"name": "Checking Account", "type": AccountType.depository,  "subtype": "Checking"},
    {"name": "401(k)",           "type": AccountType.investment,  "subtype": "401k"},
    {"name": "Stocks",           "type": AccountType.investment,  "subtype": "Stock"},
]


async def ensure_default_accounts(user_id: str, db: AsyncSession):
    """Create the 4 default accounts if the user has none."""
    result = await db.execute(
        select(Account).where(Account.user_id == user_id)
    )
    existing = result.scalars().all()
    if len(existing) > 0:
        return  # User already has accounts, skip

    for template in DEFAULT_ACCOUNTS:
        acc = Account(
            user_id=user_id,
            name=template["name"],
            type=template["type"],
            subtype=template["subtype"],
            balance=0.0,
        )
        db.add(acc)
    await db.commit()


@router.get("")
async def get_accounts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all accounts. Auto-seeds defaults on first access."""
    await ensure_default_accounts(current_user.id, db)

    stmt = select(Account).where(Account.user_id == current_user.id).order_by(Account.type)
    result = await db.execute(stmt)
    accounts = result.scalars().all()

    return [a.to_dict() for a in accounts]


@router.post("")
async def create_account(
    account_in: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new account."""
    try:
        acc_type = AccountType(account_in["type"].lower())
    except (ValueError, KeyError):
        raise HTTPException(
            status_code=400,
            detail="Invalid account type. Must be depository, credit, investment, or loan."
        )

    new_account = Account(
        user_id=current_user.id,
        name=account_in.get("name", "New Account"),
        type=acc_type,
        subtype=account_in.get("subtype", "Checking"),
        balance=float(account_in.get("balance", 0.0)),
        currency=account_in.get("currency", "USD")
    )

    db.add(new_account)
    await db.commit()
    if new_account.type == AccountType.credit:
        await sync_credit_card_bill(db, current_user.id)
    await db.refresh(new_account)

    return new_account.to_dict()


@router.patch("/{account_id}")
async def update_account(
    account_id: str,
    updates: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update an account's name or balance."""
    stmt = select(Account).where(Account.id == account_id, Account.user_id == current_user.id)
    result = await db.execute(stmt)
    account = result.scalar_one_or_none()

    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    if "name" in updates:
        account.name = updates["name"]
    if "balance" in updates:
        account.balance = float(updates["balance"])

    db.add(account)
    await db.commit()
    if account.type == AccountType.credit:
        await sync_credit_card_bill(db, current_user.id)
    await db.refresh(account)

    return account.to_dict()


@router.delete("/{account_id}")
async def delete_account(
    account_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete an account."""
    stmt = select(Account).where(Account.id == account_id, Account.user_id == current_user.id)
    result = await db.execute(stmt)
    account = result.scalar_one_or_none()

    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    is_credit = account.type == AccountType.credit
    await db.delete(account)
    await db.commit()
    if is_credit:
        await sync_credit_card_bill(db, current_user.id)
        

    return {"message": "Account successfully deleted."}


@router.get("/net-worth")
async def get_net_worth(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Compute current net worth and return historical snapshots."""
    await ensure_default_accounts(current_user.id, db)

    accounts = (await db.execute(
        select(Account).where(Account.user_id == current_user.id)
    )).scalars().all()

    total_assets = sum(a.balance for a in accounts if a.type in (AccountType.depository, AccountType.investment))
    total_liabilities = sum(a.balance for a in accounts if a.type in (AccountType.credit, AccountType.loan))
    net_worth = total_assets - total_liabilities

    # Save today's snapshot (upsert)
    today = date.today()
    existing = (await db.execute(
        select(NetWorthSnapshot)
        .where(NetWorthSnapshot.user_id == current_user.id)
        .where(NetWorthSnapshot.date == today)
    )).scalar_one_or_none()

    if existing:
        existing.total_assets = total_assets
        existing.total_liabilities = total_liabilities
        existing.net_worth = net_worth
        db.add(existing)
    else:
        snapshot = NetWorthSnapshot(
            user_id=current_user.id,
            date=today,
            total_assets=total_assets,
            total_liabilities=total_liabilities,
            net_worth=net_worth,
        )
        db.add(snapshot)
    await db.commit()

    # Fetch historical snapshots
    history = (await db.execute(
        select(NetWorthSnapshot)
        .where(NetWorthSnapshot.user_id == current_user.id)
        .order_by(NetWorthSnapshot.date)
    )).scalars().all()

    return {
        "current": {
            "totalAssets": round(total_assets, 2),
            "totalLiabilities": round(total_liabilities, 2),
            "netWorth": round(net_worth, 2),
        },
        "history": [s.to_dict() for s in history],
    }

