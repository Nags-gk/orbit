"""
Orbit AI Backend — FastAPI application entry point.
"""
import random
from datetime import date, timedelta
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, func

from .config import get_settings
from .database import init_db, async_session
from .models import Transaction, Subscription, TransactionType, TransactionCategory
from .routers import chat, transactions, analytics, documents, budgets, auth

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    await init_db()
    print("🚀 Orbit AI Backend is ready")
    yield
    print("👋 Shutting down Orbit AI Backend")

app = FastAPI(
    title="Orbit AI Backend",
    description="AI-powered financial assistant API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(transactions.router)
app.include_router(analytics.router)
app.include_router(documents.router)
app.include_router(budgets.router)


@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "0.1.0"}
