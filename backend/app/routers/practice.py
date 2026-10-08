"""
SwaraGPT - Practice Exercises & Dynamic Riyaz Plans Router
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.connection import get_db
from app.models.user import User, UserProfile
from app.models.raga import PracticeExercise
from app.models.session import PracticeSession
from app.schemas.raga import ExerciseResponse
from app.services.auth_service import get_current_user_optional
from app.ai.recommendation_engine import generate_personalized_plan

router = APIRouter()


@router.get("/recommendations")
async def get_practice_recommendations(
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """Generate dynamic, personalized Riyaz plan based on weak notes and past performance."""
    user_id = current_user.id if current_user else 1
    user_name = current_user.name if current_user else "Om Mane"

    stmt = select(UserProfile).where(UserProfile.user_id == user_id)
    res = await db.execute(stmt)
    prof = res.scalar_one_or_none()

    weak = prof.weak_swaras if prof else ["Shuddha Ga", "Tivra Ma"]
    target = prof.target_ragas[0] if (prof and prof.target_ragas) else "Yaman"
    exp = prof.experience_level if prof else "Intermediate"
    goal = prof.daily_goal_minutes if prof else 25

    plan = generate_personalized_plan(
        user_name=user_name,
        experience_level=exp,
        target_raga=target,
        weak_swaras=weak,
        daily_goal_minutes=goal,
        recent_average_score=81.5,
    )
    return plan


@router.get("/exercises", response_model=List[ExerciseResponse])
async def list_exercises(db: AsyncSession = Depends(get_db)):
    """Retrieve structured classical training drills (Alankars, Saptak, Pakad)."""
    stmt = select(PracticeExercise).order_by(PracticeExercise.id.asc())
    res = await db.execute(stmt)
    exercises = res.scalars().all()
    return exercises
