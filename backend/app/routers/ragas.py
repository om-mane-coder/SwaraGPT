"""
SwaraGPT - Raga Explorer & Master Data Router
Provides search, filtering, and detail endpoints for Classical Ragas.
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.connection import get_db
from app.models.raga import RagaMaster
from app.schemas.raga import RagaResponse

router = APIRouter()


@router.get("", response_model=List[RagaResponse])
async def list_ragas(
    q: Optional[str] = Query(None, description="Search query by name, thaat, or swaras"),
    tradition: Optional[str] = Query(None, description="Filter by tradition: Hindustani or Carnatic"),
    thaat: Optional[str] = Query(None, description="Filter by Thaat"),
    db: AsyncSession = Depends(get_db),
):
    """Browse and search the Raga Master Catalog."""
    stmt = select(RagaMaster)
    if tradition:
        stmt = stmt.where(RagaMaster.tradition.ilike(f"%{tradition}%"))
    if thaat:
        stmt = stmt.where(RagaMaster.thaat.ilike(f"%{thaat}%"))
    
    res = await db.execute(stmt)
    ragas = res.scalars().all()

    if q:
        query_lower = q.lower()
        ragas = [
            r for r in ragas
            if query_lower in r.name.lower()
            or (r.thaat and query_lower in r.thaat.lower())
            or (r.rasa and query_lower in r.rasa.lower())
            or (r.pakad and query_lower in r.pakad.lower())
        ]

    return ragas


@router.get("/{raga_id}", response_model=RagaResponse)
async def get_raga_details(
    raga_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve in-depth musical grammar and practice rules for a specific Raga."""
    stmt = select(RagaMaster).where(RagaMaster.id == raga_id)
    res = await db.execute(stmt)
    raga = res.scalar_one_or_none()

    if not raga:
        raise HTTPException(status_code=404, detail=f"Raga with ID {raga_id} not found.")

    return raga
