"""
SQLAlchemy ORM models for the Orbit database.
"""
from __future__ import annotations
import uuid
from typing import Optional, List
from datetime import datetime, date
from sqlalchemy import String, Float, Boolean, Date, DateTime, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base
import enum


# ── Enums ──────────────────────────────────────────────────

class TransactionType(str, enum.Enum):
    income = "income"
    expense = "expense"


class TransactionCategory(str, enum.Enum):
    Food = "Food"
    Transport = "Transport"
    Utilities = "Utilities"
    Entertainment = "Entertainment"
    Shopping = "Shopping"
    Income = "Income"
    Subscription = "Subscription"


class MessageRole(str, enum.Enum):
    user = "user"
    assistant = "assistant"
    system = "system"


# ── Helper ─────────────────────────────────────────────────

def _uuid() -> str:
    return str(uuid.uuid4())


# ── Models ─────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    transactions: Mapped[List["Transaction"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    subscriptions: Mapped[List["Subscription"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    conversations: Mapped[List["Conversation"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    budget_goals: Mapped[List["BudgetGoal"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    documents: Mapped[List["Document"]] = relationship(back_populates="user", cascade="all, delete-orphan")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "email": self.email,
            "fullName": self.full_name,
        }


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    date: Mapped[date] = mapped_column(Date, default=date.today)
    description: Mapped[str] = mapped_column(String(255))
    category: Mapped[TransactionCategory] = mapped_column(SAEnum(TransactionCategory))
    amount: Mapped[float] = mapped_column(Float)
    type: Mapped[TransactionType] = mapped_column(SAEnum(TransactionType))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="transactions")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "date": self.date.isoformat(),
            "description": self.description,
            "category": self.category.value,
            "amount": self.amount,
            "type": self.type.value,
        }


class Subscription(Base):
    __tablename__ = "subscriptions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(255))
    cost: Mapped[float] = mapped_column(Float)
    renewal_date: Mapped[date] = mapped_column(Date)
    category: Mapped[str] = mapped_column(String(100))
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    logo: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    user: Mapped["User"] = relationship(back_populates="subscriptions")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "cost": self.cost,
            "renewalDate": self.renewal_date.isoformat(),
            "category": self.category,
            "active": self.active,
            "logo": self.logo,
        }


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(255), default="New Chat")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="conversations")
    messages: Mapped[List["Message"]] = relationship(back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    conversation_id: Mapped[str] = mapped_column(ForeignKey("conversations.id", ondelete="CASCADE"))
    role: Mapped[MessageRole] = mapped_column(SAEnum(MessageRole))
    content: Mapped[str] = mapped_column(Text)
    tool_calls: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON string of tool calls
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    conversation: Mapped["Conversation"] = relationship(back_populates="messages")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "role": self.role.value,
            "content": self.content,
            "toolCalls": self.tool_calls,
            "createdAt": self.created_at.isoformat(),
        }


class BudgetGoal(Base):
    __tablename__ = "budget_goals"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    category: Mapped[str] = mapped_column(String(100))
    monthly_limit: Mapped[float] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="budget_goals")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "category": self.category,
            "monthlyLimit": self.monthly_limit,
        }


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    filename: Mapped[str] = mapped_column(String(255))
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="documents")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "filename": self.filename,
            "createdAt": self.created_at.isoformat(),
        }

