import uuid
import json
from datetime import datetime
from sqlalchemy import Column, String, Text, Float, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def gen_uuid():
    return str(uuid.uuid4())

# SQLite-compatible JSON type
from sqlalchemy import TypeDecorator
class JSONType(TypeDecorator):
    impl = Text
    cache_ok = True
    def process_bind_param(self, value, dialect):
        return json.dumps(value) if value is not None else None
    def process_result_value(self, value, dialect):
        return json.loads(value) if value else None

class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    interview_sessions = relationship("InterviewSession", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")

class Resume(Base):
    __tablename__ = "resumes"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    content = Column(Text, nullable=True)
    parsed_data = Column(JSONType, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="resumes")
    scores = relationship("ResumeScore", back_populates="resume", cascade="all, delete-orphan")
    ats_reports = relationship("ATSReport", back_populates="resume", cascade="all, delete-orphan")

class ResumeScore(Base):
    __tablename__ = "resume_scores"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    resume_id = Column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    overall = Column(Float, nullable=False)
    sections = Column(JSONType, nullable=False)
    suggestions = Column(JSONType, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    resume = relationship("Resume", back_populates="scores")

class ATSReport(Base):
    __tablename__ = "ats_reports"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    resume_id = Column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    score = Column(Float, nullable=False)
    keyword_match = Column(Float, nullable=False)
    formatting_score = Column(Float, nullable=False)
    action_verbs_score = Column(Float, nullable=False)
    readability_score = Column(Float, nullable=False)
    missing_keywords = Column(JSONType, nullable=False)
    found_keywords = Column(JSONType, nullable=False)
    suggestions = Column(JSONType, nullable=False)
    job_description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    resume = relationship("Resume", back_populates="ats_reports")

class InterviewSession(Base):
    __tablename__ = "interview_sessions"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_role = Column(String(255), nullable=False)
    company = Column(String(255), nullable=True)
    interview_type = Column(String(50), nullable=False, default="mixed")
    status = Column(String(50), nullable=False, default="pending")
    scores = Column(JSONType, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    user = relationship("User", back_populates="interview_sessions")
    questions = relationship("InterviewQuestion", back_populates="session", cascade="all, delete-orphan")

class InterviewQuestion(Base):
    __tablename__ = "interview_questions"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    session_id = Column(String(36), ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False)
    question = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    expected_points = Column(JSONType, nullable=True)
    answer = Column(Text, nullable=True)
    feedback = Column(Text, nullable=True)
    score = Column(Float, nullable=True)
    question_order = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    session = relationship("InterviewSession", back_populates="questions")

class Report(Base):
    __tablename__ = "reports"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=True)
    file_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="reports")

class AgentLog(Base):
    __tablename__ = "agent_logs"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    agent_name = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False)
    input_data = Column(JSONType, nullable=True)
    output_data = Column(JSONType, nullable=True)
    error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
