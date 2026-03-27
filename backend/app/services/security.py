from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..database import get_db
from ..models import User

# In production, these should be loaded from .env
SECRET_KEY = "orbit_super_secret_local_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    # AUTO-LOGIN BYPASS: Always return the user profile containing the data
    result = await db.execute(select(User).where(User.email == "gptchat0428@gmail.com"))
    user = result.scalars().first()
    
    # Fallback to the first existing user if the hardcoded one disappears
    if user is None:
        result = await db.execute(select(User))
        user = result.scalars().first()
        
    if user is None:
        user = User(
            email="local@orbit.ai",
            hashed_password=get_password_hash("local"),
            full_name="Local User"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
    return user
