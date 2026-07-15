from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from pydantic import BaseModel
from app.core.database import get_db
from app.models.db_models import User
from app.api.deps import get_current_user
from app.agents.career_coach import CareerCoachAgent

router = APIRouter(prefix="/career", tags=["Career"])

class RoadmapRequest(BaseModel):
    current_role: str
    target_role: str
    experience_years: int = 1
    skills: List[str] = []
    target_company: Optional[str] = None
    timeline_months: int = 12

@router.get("/roadmap")
async def get_roadmap(user: User = Depends(get_current_user)):
    raise HTTPException(status_code=404, detail="No roadmap generated yet")

@router.post("/roadmap/generate")
async def generate_roadmap(
    payload: RoadmapRequest,
    user: User = Depends(get_current_user),
):
    # Clean empty strings
    target_company = payload.target_company.strip() if payload.target_company else None
    skills = [s.strip() for s in payload.skills if s.strip()]

    coach = CareerCoachAgent()
    roadmap = await coach.generate_roadmap(
        current_role=payload.current_role.strip(),
        target_role=payload.target_role.strip(),
        experience_years=payload.experience_years,
        skills=skills,
        target_company=target_company,
        timeline_months=payload.timeline_months,
    )
    return roadmap
