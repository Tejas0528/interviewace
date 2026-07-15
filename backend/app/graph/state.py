"""
InterviewAce LangGraph State Definitions
Typed state object shared across all agent nodes.
"""
from typing import TypedDict, Optional, List, Any, Annotated
from operator import add


class ResumeState(TypedDict, total=False):
    """State for resume analysis pipeline."""
    resume_text: str
    file_path: str
    parsed_data: dict
    score: dict
    ats_score: dict
    improved_content: str
    improvement_changes: List[str]


class InterviewState(TypedDict, total=False):
    """State for interview pipeline."""
    session_id: str
    job_role: str
    company: Optional[str]
    interview_type: str
    current_question_index: int
    questions: Annotated[List[dict], add]
    answers: Annotated[List[dict], add]
    feedback_list: Annotated[List[dict], add]
    final_scores: dict


class CareerState(TypedDict, total=False):
    """State for career coaching pipeline."""
    current_role: str
    target_role: str
    experience_years: int
    skills: List[str]
    roadmap: dict


class GlobalState(TypedDict, total=False):
    """Master state for the complete InterviewAce workflow."""
    user_id: str
    current_step: str
    errors: Annotated[List[str], add]

    # Resume sub-state
    resume: ResumeState

    # Interview sub-state
    interview: InterviewState

    # Career sub-state
    career: CareerState

    # Report
    report_path: Optional[str]
    report_summary: Optional[str]

    # Metadata
    started_at: Optional[str]
    completed_at: Optional[str]
