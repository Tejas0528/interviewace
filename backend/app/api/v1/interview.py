from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.models.db_models import User, InterviewSession, InterviewQuestion
from app.schemas.schemas import (
    CreateSessionRequest, InterviewSessionResponse, InterviewQuestionResponse,
    SubmitAnswerRequest, AnswerFeedbackResponse, LearningContentResponse, CompanyGuideResponse
)
from app.api.deps import get_current_user
from app.agents.mock_interviewer import MockInterviewerAgent
from app.agents.feedback_agent import FeedbackAgent
from app.agents.interview_coach import InterviewCoachAgent
from app.agents.company_preparation import CompanyPreparationAgent

router = APIRouter(prefix="/interview", tags=["Interview"])

class QuizRequest(BaseModel):
    topic: str

@router.post("/sessions", response_model=InterviewSessionResponse, status_code=201)
async def create_session(payload: CreateSessionRequest, db: AsyncSession = Depends(get_db),
                         user: User = Depends(get_current_user)):
    session = InterviewSession(
        user_id=user.id, job_role=payload.job_role,
        company=payload.company, interview_type=payload.interview_type, status="active",
    )
    db.add(session)
    await db.commit()

    result = await db.execute(
        select(InterviewSession)
        .options(selectinload(InterviewSession.questions))
        .where(InterviewSession.id == session.id)
    )
    return result.scalar_one()

@router.get("/sessions", response_model=List[InterviewSessionResponse])
async def list_sessions(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(
        select(InterviewSession)
        .options(selectinload(InterviewSession.questions))
        .where(InterviewSession.user_id == user.id)
        .order_by(InterviewSession.started_at.desc()))
    return result.scalars().all()

@router.get("/sessions/{session_id}", response_model=InterviewSessionResponse)
async def get_session(session_id: str, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(
        select(InterviewSession)
        .options(selectinload(InterviewSession.questions))
        .where(InterviewSession.id == session_id, InterviewSession.user_id == user.id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.get("/sessions/{session_id}/next-question", response_model=InterviewQuestionResponse)
async def get_next_question(session_id: str, db: AsyncSession = Depends(get_db),
                            user: User = Depends(get_current_user)):
    result = await db.execute(select(InterviewSession).where(
        InterviewSession.id == session_id, InterviewSession.user_id == user.id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    q_result = await db.execute(select(InterviewQuestion).where(
        InterviewQuestion.session_id == session_id))
    existing = q_result.scalars().all()
    order = len(existing)

    # Pass previous questions for context
    prev_questions = [q.question for q in existing[-3:]]

    interviewer = MockInterviewerAgent()
    q_data = await interviewer.generate_question(
        session.job_role, session.interview_type, order, session.company, prev_questions)

    question = InterviewQuestion(
        session_id=session_id, question=q_data["question"], category=q_data["category"],
        expected_points=q_data.get("expected_points"), question_order=order,
    )
    db.add(question)
    await db.commit()
    await db.refresh(question)
    return question

@router.post("/sessions/{session_id}/answer", response_model=AnswerFeedbackResponse)
async def submit_answer(session_id: str, payload: SubmitAnswerRequest,
                        db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    q_result = await db.execute(select(InterviewQuestion).where(
        InterviewQuestion.id == payload.question_id))
    question = q_result.scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    s_result = await db.execute(select(InterviewSession).where(
        InterviewSession.id == session_id, InterviewSession.user_id == user.id))
    session = s_result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    feedback_agent = FeedbackAgent()
    evaluation = await feedback_agent.evaluate_answer(
        question=question.question, answer=payload.answer,
        category=question.category, expected_points=question.expected_points)

    question.answer = payload.answer
    question.feedback = evaluation.get("feedback", "")
    question.score = evaluation.get("score", 5)
    await db.commit()

    # Check if more questions
    q_count_result = await db.execute(select(InterviewQuestion).where(
        InterviewQuestion.session_id == session_id))
    all_questions = q_count_result.scalars().all()

    next_question = None
    if len(all_questions) < 10:
        prev_questions = [q.question for q in all_questions[-3:]]
        interviewer = MockInterviewerAgent()
        q_data = await interviewer.generate_question(
            session.job_role, session.interview_type, len(all_questions), session.company, prev_questions)
        nq = InterviewQuestion(
            session_id=session_id, question=q_data["question"], category=q_data["category"],
            expected_points=q_data.get("expected_points"), question_order=len(all_questions))
        db.add(nq)
        await db.commit()
        await db.refresh(nq)
        next_question = nq

    return AnswerFeedbackResponse(
        feedback=evaluation.get("feedback", ""),
        score=evaluation.get("score", 5),
        next_question=next_question,
    )

@router.post("/sessions/{session_id}/complete", response_model=InterviewSessionResponse)
async def complete_session(session_id: str, db: AsyncSession = Depends(get_db),
                           user: User = Depends(get_current_user)):
    result = await db.execute(select(InterviewSession).where(
        InterviewSession.id == session_id, InterviewSession.user_id == user.id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    q_result = await db.execute(select(InterviewQuestion).where(
        InterviewQuestion.session_id == session_id, InterviewQuestion.score.isnot(None)))
    answered = q_result.scalars().all()

    # Generate comprehensive final report
    feedback_agent = FeedbackAgent()
    session_data = {
        "job_role": session.job_role,
        "interview_type": session.interview_type,
        "questions_answered": len(answered),
        "answers": [{"q": q.question, "a": q.answer, "score": q.score, "feedback": q.feedback}
                    for q in answered]
    }
    final_report = await feedback_agent.generate_final_report(session_data)

    avg_score = sum(q.score for q in answered) / len(answered) if answered else 5
    overall = round(avg_score * 10)

    scores = final_report.get("scores", {}) if final_report else {}
    session.status = "completed"
    session.completed_at = datetime.utcnow()
    session.scores = {
        "overall": overall,
        "technical_accuracy": scores.get("technical_accuracy", round(avg_score * 9.8)),
        "communication": scores.get("communication", round(avg_score * 10.2)),
        "confidence": scores.get("confidence", round(avg_score * 9.5)),
        "behavioral": scores.get("behavioral", round(avg_score * 9.6)),
        "star_method": scores.get("star_method", round(avg_score * 9.3)),
        "professionalism": scores.get("professionalism", round(avg_score * 10.5)),
        "problem_solving": scores.get("problem_solving", round(avg_score * 9.7)),
        "performance_summary": final_report.get("performance_summary", ""),
        "strong_areas": final_report.get("strong_areas", []),
        "weak_areas": final_report.get("weak_areas", []),
        "top_improvements": final_report.get("top_improvements", []),
        "interview_readiness": final_report.get("interview_readiness", ""),
        "next_steps": final_report.get("next_steps", []),
    }
    await db.commit()
    result = await db.execute(
        select(InterviewSession)
        .options(selectinload(InterviewSession.questions))
        .where(InterviewSession.id == session_id)
    )
    return result.scalar_one()

@router.get("/learn/{topic}", response_model=LearningContentResponse)
async def learn_topic(topic: str, user: User = Depends(get_current_user)):
    coach = InterviewCoachAgent()
    content = await coach.get_learning_content(topic)
    # Convert rich content to simplified response
    return LearningContentResponse(
        content=content.get("theory", content.get("overview", "")),
        examples=[ex.get("best_answer", "") for ex in content.get("examples", [])[:3]]
    )

@router.get("/learn/{topic}/full")
async def learn_topic_full(topic: str, user: User = Depends(get_current_user)):
    """Get full rich learning content including all sections."""
    coach = InterviewCoachAgent()
    return await coach.get_learning_content(topic)

@router.post("/quiz")
async def get_quiz(payload: QuizRequest, user: User = Depends(get_current_user)):
    coach = InterviewCoachAgent()
    return await coach.get_quiz(payload.topic)

@router.get("/company/{company}")
async def get_company_guide(company: str, user: User = Depends(get_current_user)):
    agent = CompanyPreparationAgent()
    return await agent.get_guide(company)

@router.get("/videos/{topic}")
async def get_learning_videos(topic: str, user: User = Depends(get_current_user)):
    from app.agents.video_recommender import VideoRecommenderAgent
    agent = VideoRecommenderAgent()
    return await agent.get_recommendations(topic)
