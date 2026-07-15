"""Initial migration - create all tables

Revision ID: 001_initial
Revises: 
Create Date: 2024-01-01 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users
    op.create_table(
        "users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("avatar_url", sa.String(500), nullable=True),
        sa.Column("is_active", sa.Boolean(), default=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()")),
    )
    op.create_index("ix_users_email", "users", ["email"])

    # Resumes
    op.create_table(
        "resumes",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("filename", sa.String(255), nullable=False),
        sa.Column("file_path", sa.String(500), nullable=False),
        sa.Column("content", sa.Text(), nullable=True),
        sa.Column("parsed_data", postgresql.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()")),
    )
    op.create_index("ix_resumes_user_id", "resumes", ["user_id"])

    # Resume Scores
    op.create_table(
        "resume_scores",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("resume_id", sa.String(36), sa.ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("overall", sa.Float(), nullable=False),
        sa.Column("sections", postgresql.JSON(), nullable=False),
        sa.Column("suggestions", postgresql.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()")),
    )

    # ATS Reports
    op.create_table(
        "ats_reports",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("resume_id", sa.String(36), sa.ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("score", sa.Float(), nullable=False),
        sa.Column("keyword_match", sa.Float(), nullable=False),
        sa.Column("formatting_score", sa.Float(), nullable=False),
        sa.Column("action_verbs_score", sa.Float(), nullable=False),
        sa.Column("readability_score", sa.Float(), nullable=False),
        sa.Column("missing_keywords", postgresql.JSON(), nullable=False),
        sa.Column("found_keywords", postgresql.JSON(), nullable=False),
        sa.Column("suggestions", postgresql.JSON(), nullable=False),
        sa.Column("job_description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()")),
    )

    # Interview Sessions
    op.create_table(
        "interview_sessions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("job_role", sa.String(255), nullable=False),
        sa.Column("company", sa.String(255), nullable=True),
        sa.Column("interview_type", sa.String(50), nullable=False),
        sa.Column("status", sa.String(50), nullable=False, default="pending"),
        sa.Column("scores", postgresql.JSON(), nullable=True),
        sa.Column("started_at", sa.DateTime(), server_default=sa.text("now()")),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_interview_sessions_user_id", "interview_sessions", ["user_id"])

    # Interview Questions
    op.create_table(
        "interview_questions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("session_id", sa.String(36), sa.ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("question", sa.Text(), nullable=False),
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("expected_points", postgresql.JSON(), nullable=True),
        sa.Column("answer", sa.Text(), nullable=True),
        sa.Column("feedback", sa.Text(), nullable=True),
        sa.Column("score", sa.Float(), nullable=True),
        sa.Column("question_order", sa.Integer(), nullable=False, default=0),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()")),
    )
    op.create_index("ix_interview_questions_session_id", "interview_questions", ["session_id"])

    # Reports
    op.create_table(
        "reports",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("file_path", sa.String(500), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()")),
    )

    # Agent Logs
    op.create_table(
        "agent_logs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("session_id", sa.String(255), nullable=True),
        sa.Column("agent_name", sa.String(100), nullable=False),
        sa.Column("status", sa.String(50), nullable=False),
        sa.Column("input_data", postgresql.JSON(), nullable=True),
        sa.Column("output_data", postgresql.JSON(), nullable=True),
        sa.Column("error", sa.Text(), nullable=True),
        sa.Column("duration_ms", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()")),
    )


def downgrade() -> None:
    op.drop_table("agent_logs")
    op.drop_table("reports")
    op.drop_table("interview_questions")
    op.drop_table("interview_sessions")
    op.drop_table("ats_reports")
    op.drop_table("resume_scores")
    op.drop_table("resumes")
    op.drop_table("users")
