from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from app.models.db_models import InterviewSession, InterviewQuestion
from typing import Optional, List


class InterviewService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_session_or_404(self, session_id: str, user_id: str) -> InterviewSession:
        result = await self.db.execute(
            select(InterviewSession).where(
                InterviewSession.id == session_id,
                InterviewSession.user_id == user_id,
            )
        )
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session

    async def get_session_questions(self, session_id: str) -> List[InterviewQuestion]:
        result = await self.db.execute(
            select(InterviewQuestion)
            .where(InterviewQuestion.session_id == session_id)
            .order_by(InterviewQuestion.question_order)
        )
        return result.scalars().all()

    async def calculate_final_scores(self, session_id: str) -> dict:
        questions = await self.get_session_questions(session_id)
        answered = [q for q in questions if q.score is not None]

        if not answered:
            return {
                "overall": 50,
                "confidence": 50,
                "communication": 50,
                "technical_accuracy": 50,
                "behavioral": 50,
                "star_method": 50,
                "professionalism": 50,
            }

        avg = sum(q.score for q in answered) / len(answered)

        # Weighted scores with some variance
        def ws(base: float, factor: float) -> int:
            return max(0, min(100, round(base * factor * 10)))

        return {
            "overall": ws(avg, 1.0),
            "confidence": ws(avg, 0.95),
            "communication": ws(avg, 1.02),
            "technical_accuracy": ws(avg, 0.98),
            "behavioral": ws(avg, 0.96),
            "star_method": ws(avg, 0.93),
            "professionalism": ws(avg, 1.05),
        }

    async def mark_complete(self, session: InterviewSession) -> InterviewSession:
        scores = await self.calculate_final_scores(session.id)
        session.status = "completed"
        session.completed_at = datetime.utcnow()
        session.scores = scores
        await self.db.commit()
        await self.db.refresh(session)
        return session
