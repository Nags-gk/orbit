"""
Analytics router — spending forecasts, anomaly detection, and insights.
"""
from __future__ import annotations
from fastapi import APIRouter, Depends

from ..database import async_session
from ..models import User
from ..services.security import get_current_user
from ..services.analytics_engine import (
    forecast_spending,
    detect_anomalies,
    generate_insights,
    subscription_recommendations,
)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/insights")
async def get_insights(current_user: User = Depends(get_current_user)):
    """Get AI-generated spending insights."""
    async with async_session() as db:
        return await generate_insights(db, current_user.id)


@router.get("/forecast")
async def get_forecast(days: int = 30, current_user: User = Depends(get_current_user)):
    """Get spending forecast."""
    async with async_session() as db:
        return await forecast_spending(db, current_user.id, forecast_days=days)


@router.get("/anomalies")
async def get_anomalies(current_user: User = Depends(get_current_user)):
    """Detect unusual transactions."""
    async with async_session() as db:
        return await detect_anomalies(db, current_user.id)


@router.get("/subscriptions/optimization")
async def get_subscription_optimization(current_user: User = Depends(get_current_user)):
    """Get subscription optimization recommendations."""
    async with async_session() as db:
        return await subscription_recommendations(db, current_user.id)
