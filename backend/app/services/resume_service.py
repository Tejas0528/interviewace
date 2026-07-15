import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from app.models.db_models import Resume, ResumeScore, ATSReport
from app.agents.resume_analyzer import ResumeAnalyzerAgent
from app.agents.resume_scorer import ResumeScorerAgent
from app.agents.ats_analyzer import ATSAnalyzerAgent
from app.agents.resume_builder import ResumeBuilderAgent
from typing import Optional


class ResumeService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_resume_or_404(self, resume_id: str, user_id: str) -> Resume:
        result = await self.db.execute(
            select(Resume).where(Resume.id == resume_id, Resume.user_id == user_id)
        )
        resume = result.scalar_one_or_none()
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        return resume

    async def save_score(self, resume_id: str, score_data: dict) -> ResumeScore:
        # Remove existing score
        existing = await self.db.execute(
            select(ResumeScore).where(ResumeScore.resume_id == resume_id)
        )
        for s in existing.scalars().all():
            await self.db.delete(s)

        score = ResumeScore(
            resume_id=resume_id,
            overall=score_data["overall"],
            sections=score_data["sections"],
            suggestions=score_data["suggestions"],
        )
        self.db.add(score)
        await self.db.commit()
        return score

    async def get_latest_score(self, resume_id: str) -> Optional[ResumeScore]:
        result = await self.db.execute(
            select(ResumeScore)
            .where(ResumeScore.resume_id == resume_id)
            .order_by(ResumeScore.created_at.desc())
        )
        return result.scalars().first()
