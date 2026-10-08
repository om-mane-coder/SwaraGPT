"""
SwaraGPT - Authentication Router
Endpoints for student registration, login, token refresh, and profile retrieval.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.connection import get_db
from app.models.user import User, UserProfile
from app.schemas.auth import (
    UserRegisterRequest, UserLoginRequest, TokenResponse,
    UserResponse, UserProfileResponse
)
from app.services.auth_service import (
    hash_password, verify_password, create_access_token,
    get_current_user
)

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
async def register(req: UserRegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new student account."""
    stmt = select(User).where(User.email == req.email)
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    user = User(
        name=req.name,
        email=req.email,
        password_hash=hash_password(req.password),
        age=req.age,
        role="student",
    )
    db.add(user)
    await db.flush()

    profile = UserProfile(
        user_id=user.id,
        experience_level=req.experience_level or "Intermediate",
        tradition=req.tradition or "Hindustani",
        preferred_tonic=req.preferred_tonic or "C3",
        preferred_tonic_hz=req.preferred_tonic_hz or 130.81,
        daily_goal_minutes=25,
        target_ragas=[req.target_raga or "Yaman"],
        current_streak_days=1,
        total_practice_minutes=0,
    )
    db.add(profile)
    await db.commit()

    # Re-fetch with loaded profile
    stmt_full = select(User).options(selectinload(User.profile)).where(User.id == user.id)
    res_full = await db.execute(stmt_full)
    user_loaded = res_full.scalar_one()

    access_token = create_access_token(data={"sub": user.email, "id": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_loaded
    }


@router.post("/login", response_model=TokenResponse)
async def login(req: UserLoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate with email and password."""
    stmt = select(User).options(selectinload(User.profile)).where(User.email == req.email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    access_token = create_access_token(data={"sub": user.email, "id": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get profile of current logged-in user."""
    return current_user


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(current_user: User = Depends(get_current_user)):
    """Refresh JWT access token."""
    access_token = create_access_token(data={"sub": current_user.email, "id": current_user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": current_user
    }
