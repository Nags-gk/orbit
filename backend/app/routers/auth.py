from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from typing import Optional

from ..database import get_db
from ..models import User
from ..services.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    fullName: Optional[str] = None

class UserUpdate(BaseModel):
    fullName: Optional[str] = None
    email: Optional[EmailStr] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

@router.post("/register", response_model=Token)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check existing user
    result = await db.execute(select(User).where(User.email == user_data.email))
    db_user = result.scalars().first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    # Create user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email, 
        hashed_password=hashed_password,
        full_name=user_data.fullName
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # Generate token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.id}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user": new_user.to_dict()}


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user": user.to_dict()}


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user.to_dict()

@router.put("/me")
async def update_me(user_update: UserUpdate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if user_update.fullName is not None:
        current_user.full_name = user_update.fullName
    
    if user_update.email is not None and user_update.email != current_user.email:
        # Check if email is already taken
        result = await db.execute(select(User).where(User.email == user_update.email))
        if result.scalars().first():
            raise HTTPException(status_code=400, detail="Email already registered")
        current_user.email = user_update.email
        
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user.to_dict()
