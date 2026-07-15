from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from app.core.database import get_db
from app.models.db_models import User, InterviewSession, Resume, ResumeScore, ATSReport
from app.schemas.schemas import AnalyticsResponse, SessionSummary, ScorePoint
from app.api.deps import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])

SCORE_LABELS = {
    "technical_accuracy": "Technical Knowledge",
    "communication": "Communication",
    "confidence": "Confidence",
    "behavioral": "Behavioral Questions",
    "star_method": "STAR Method",
    "professionalism": "Professionalism",
    "problem_solving": "Problem Solving",
}

def _derive_areas_from_scores(sessions_with_scores: list) -> tuple[list, list]:
    """Derive weak/strong areas from actual score breakdowns."""
    if not sessions_with_scores:
        return [], []

    # Aggregate scores per dimension across all sessions
    totals = {}
    counts = {}
    for s in sessions_with_scores:
        sc = s.scores or {}
        for key, label in SCORE_LABELS.items():
            val = sc.get(key)
            if val is not None:
                totals[label] = totals.get(label, 0) + float(val)
                counts[label] = counts.get(label, 0) + 1

    if not totals:
        return [], []

    # Compute averages
    avgs = {label: totals[label] / counts[label] for label in totals}

    # Sort by score
    sorted_areas = sorted(avgs.items(), key=lambda x: x[1])

    weak = [label for label, score in sorted_areas if score < 65][:4]
    strong = [label for label, score in sorted_areas[::-1] if score >= 70][:4]

    return weak or [label for label, _ in sorted_areas[:2]], strong or [label for label, _ in sorted_areas[-2:]]


@router.get("/dashboard", response_model=AnalyticsResponse)
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    s_result = await db.execute(
        select(InterviewSession).where(
            InterviewSession.user_id == user.id,
            InterviewSession.status == "completed",
        )
    )
    sessions = s_result.scalars().all()

    total_sessions = len(sessions)
    avg_score = 0.0
    improvement_rate = 0.0
    score_trend = []
    recent_sessions = []
    weak_areas = []
    strong_areas = []

    if sessions:
        scores_with_data = [s for s in sessions if s.scores]
        sorted_sessions = sorted(scores_with_data, key=lambda x: x.started_at)

        if scores_with_data:
            avg_score = sum(s.scores.get("overall", 0) for s in scores_with_data) / len(scores_with_data)

        # Real score trend
        for s in sorted_sessions[-7:]:
            score_trend.append(ScorePoint(
                date=s.started_at.strftime("%b %d"),
                score=s.scores.get("overall", 0),
            ))

        # Improvement rate
        if len(sorted_sessions) >= 2:
            mid = max(1, len(sorted_sessions) // 2)
            first_avg = sum(s.scores.get("overall", 0) for s in sorted_sessions[:mid]) / mid
            second_half = sorted_sessions[mid:]
            if second_half:
                second_avg = sum(s.scores.get("overall", 0) for s in second_half) / len(second_half)
                if first_avg > 0:
                    improvement_rate = round(((second_avg - first_avg) / first_avg) * 100, 1)

        # Derive weak/strong from actual score breakdown
        weak_areas, strong_areas = _derive_areas_from_scores(scores_with_data)

        # If AI populated them, prefer those
        all_ai_weak = []
        all_ai_strong = []
        for s in scores_with_data:
            all_ai_weak.extend(s.scores.get("weak_areas", []))
            all_ai_strong.extend(s.scores.get("strong_areas", []))

        if all_ai_weak:
            from collections import Counter
            weak_areas = [w for w, _ in Counter(all_ai_weak).most_common(4)]
        if all_ai_strong:
            from collections import Counter
            strong_areas = [s for s, _ in Counter(all_ai_strong).most_common(4)]

        # Recent sessions
        for s in sorted(sessions, key=lambda x: x.started_at, reverse=True)[:8]:
            duration = 25
            if s.completed_at and s.started_at:
                duration = max(5, int((s.completed_at - s.started_at).total_seconds() / 60))
            recent_sessions.append(SessionSummary(
                id=s.id,
                date=s.started_at.strftime("%Y-%m-%d"),
                score=s.scores.get("overall", 0) if s.scores else 0,
                type=s.interview_type.replace("_", " ").title(),
                duration_minutes=duration,
            ))

    # Compute skill breakdown averages
    skill_breakdown = None
    if scores_with_data:
        keys = ["technical_accuracy", "communication", "confidence", "behavioral", "star_method", "professionalism", "problem_solving"]
        breakdown = {}
        for key in keys:
            vals = [s.scores.get(key) for s in scores_with_data if s.scores and s.scores.get(key) is not None]
            if vals:
                breakdown[key] = round(sum(vals) / len(vals))
        skill_breakdown = breakdown if breakdown else None

    return AnalyticsResponse(
        total_sessions=total_sessions,
        average_score=round(avg_score),
        improvement_rate=improvement_rate,
        weak_areas=weak_areas if weak_areas else ["Complete a mock interview to see insights"],
        strong_areas=strong_areas if strong_areas else ["Complete a mock interview to see insights"],
        recent_sessions=recent_sessions,
        score_trend=score_trend,
        skill_breakdown=skill_breakdown,
    )


@router.get("/resume-history")
async def get_resume_history(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Resume).where(Resume.user_id == user.id).order_by(Resume.created_at)
    )
    resumes = result.scalars().all()

    history = []
    for resume in resumes:
        score_result = await db.execute(
            select(ResumeScore)
            .where(ResumeScore.resume_id == resume.id)
            .order_by(ResumeScore.created_at.desc())
        )
        latest_score = score_result.scalars().first()

        ats_result = await db.execute(
            select(ATSReport)
            .where(ATSReport.resume_id == resume.id)
            .order_by(ATSReport.created_at.desc())
        )
        latest_ats = ats_result.scalars().first()

        history.append({
            "id": resume.id,
            "filename": resume.filename,
            "date": resume.created_at.strftime("%Y-%m-%d"),
            "resume_score": latest_score.overall if latest_score else None,
            "ats_score": latest_ats.score if latest_ats else None,
        })

    return {"history": history}
