from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# Auth
class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=2)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Resume
class ResumeResponse(BaseModel):
    id: str
    user_id: str
    filename: str
    content: Optional[str] = None
    parsed_data: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ResumeSectionScores(BaseModel):
    summary: float
    experience: float
    education: float
    skills: float
    projects: float
    formatting: float
    grammar: float

class ResumeScoreResponse(BaseModel):
    overall: float
    sections: ResumeSectionScores
    suggestions: List[str]

class ATSScoreResponse(BaseModel):
    score: float
    keyword_match: float
    formatting_score: float
    action_verbs_score: float
    readability_score: float
    missing_keywords: List[str]
    found_keywords: List[str]
    suggestions: List[str]

class ResumeImproveResponse(BaseModel):
    improved_content: str
    changes: List[str]

# Interview
class CreateSessionRequest(BaseModel):
    job_role: str
    company: Optional[str] = None
    interview_type: str = "mixed"
    resume_id: Optional[str] = None

class InterviewQuestionResponse(BaseModel):
    id: str
    question: str
    category: str
    expected_points: Optional[List[str]] = None

    class Config:
        from_attributes = True

class SubmitAnswerRequest(BaseModel):
    question_id: str
    answer: str

class AnswerFeedbackResponse(BaseModel):
    feedback: str
    score: float
    next_question: Optional[InterviewQuestionResponse] = None

class InterviewScoresResponse(BaseModel):
    overall: float
    confidence: float
    communication: float
    technical_accuracy: float
    behavioral: float
    star_method: float
    professionalism: float

class InterviewSessionResponse(BaseModel):
    id: str
    user_id: str
    job_role: str
    company: Optional[str] = None
    interview_type: str
    status: str
    questions: List[InterviewQuestionResponse] = []
    scores: Optional[InterviewScoresResponse] = None
    started_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class LearningContentResponse(BaseModel):
    content: str
    examples: List[str]

class CompanyGuideResponse(BaseModel):
    company: str
    rounds: List[str]
    tips: List[str]
    sample_questions: List[str]
    culture: str

# Analytics
class ScorePoint(BaseModel):
    date: str
    score: float

class SessionSummary(BaseModel):
    id: str
    date: str
    score: float
    type: str
    duration_minutes: int

class AnalyticsResponse(BaseModel):
    total_sessions: int
    average_score: float
    improvement_rate: float
    weak_areas: List[str]
    strong_areas: List[str]
    recent_sessions: List[SessionSummary]
    score_trend: List[ScorePoint]
    skill_breakdown: Optional[dict] = None

# Career
class GenerateRoadmapRequest(BaseModel):
    current_role: str
    target_role: str
    experience_years: int
    skills: List[str]

class Milestone(BaseModel):
    title: str
    description: str
    timeline: str
    resources: List[str]

class Course(BaseModel):
    title: str
    platform: str
    url: str
    duration: str
    level: str

class ProjectRecommendation(BaseModel):
    title: str
    description: str
    technologies: List[str]
    difficulty: str
    estimated_time: str

class CareerRoadmapResponse(BaseModel):
    current_role: str
    target_role: str
    timeline_months: int
    milestones: List[Milestone]
    recommended_courses: List[Course]
    recommended_projects: List[ProjectRecommendation]
    skills_to_learn: List[str]

# Reports
class ReportResponse(BaseModel):
    id: str
    type: str
    title: str
    summary: Optional[str] = None
    created_at: datetime
    download_url: str

    class Config:
        from_attributes = True
