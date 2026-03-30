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
from .routers import chat, transactions, analytics, documents, budgets, auth, accounts, bills, goals, reports
from fastapi.staticfiles import StaticFiles
import os

settings = get_settings()

os.makedirs("uploads", exist_ok=True)



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

# CORS — allow for broad local network usage (IPs, phone access)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False, # Standardized to False for '*' cross-origin with fetch
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
app.include_router(accounts.router)
app.include_router(bills.router)
app.include_router(goals.router)
app.include_router(reports.router)


@app.get("/")
async def root():
    """Simple API root for easy backend discovery."""
    return {
        "app": "Orbit AI Backend",
        "status": "ready",
        "documentation": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "0.1.0"}


app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
