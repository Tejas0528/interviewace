from typing import TypedDict, Optional, List, Any
from langgraph.graph import StateGraph, END

class InterviewAceState(TypedDict):
    user_id: str
    resume_text: Optional[str]
    parsed_resume: Optional[dict]
    resume_score: Optional[dict]
    ats_score: Optional[dict]
    improved_resume: Optional[str]
    job_role: Optional[str]
    company: Optional[str]
    interview_type: Optional[str]
    questions: List[dict]
    answers: List[dict]
    feedback_list: List[dict]
    final_scores: Optional[dict]
    career_roadmap: Optional[dict]
    report_path: Optional[str]
    current_step: str
    errors: List[str]

def create_workflow():
    """Create the main InterviewAce LangGraph workflow."""
    workflow = StateGraph(InterviewAceState)

    # Add nodes
    workflow.add_node("parse_resume", parse_resume_node)
    workflow.add_node("score_resume", score_resume_node)
    workflow.add_node("analyze_ats", analyze_ats_node)
    workflow.add_node("improve_resume", improve_resume_node)
    workflow.add_node("conduct_interview", conduct_interview_node)
    workflow.add_node("evaluate_answers", evaluate_answers_node)
    workflow.add_node("generate_career_plan", generate_career_plan_node)
    workflow.add_node("generate_report", generate_report_node)

    # Set entry point
    workflow.set_entry_point("parse_resume")

    # Add edges
    workflow.add_edge("parse_resume", "score_resume")
    workflow.add_edge("score_resume", "analyze_ats")
    workflow.add_edge("analyze_ats", "improve_resume")
    workflow.add_edge("improve_resume", "conduct_interview")
    workflow.add_edge("conduct_interview", "evaluate_answers")
    workflow.add_edge("evaluate_answers", "generate_career_plan")
    workflow.add_edge("generate_career_plan", "generate_report")
    workflow.add_edge("generate_report", END)

    return workflow.compile()

async def parse_resume_node(state: InterviewAceState) -> InterviewAceState:
    from app.agents.resume_analyzer import ResumeAnalyzerAgent
    agent = ResumeAnalyzerAgent()
    parsed = await agent.parse(state.get("resume_text", ""))
    return {**state, "parsed_resume": parsed, "current_step": "resume_parsed"}

async def score_resume_node(state: InterviewAceState) -> InterviewAceState:
    from app.agents.resume_scorer import ResumeScorerAgent
    agent = ResumeScorerAgent()
    score = await agent.score(state.get("resume_text", ""), state.get("parsed_resume"))
    return {**state, "resume_score": score, "current_step": "resume_scored"}

async def analyze_ats_node(state: InterviewAceState) -> InterviewAceState:
    from app.agents.ats_analyzer import ATSAnalyzerAgent
    agent = ATSAnalyzerAgent()
    ats = await agent.analyze(state.get("resume_text", ""))
    return {**state, "ats_score": ats, "current_step": "ats_analyzed"}

async def improve_resume_node(state: InterviewAceState) -> InterviewAceState:
    from app.agents.resume_builder import ResumeBuilderAgent
    agent = ResumeBuilderAgent()
    improved = await agent.improve(state.get("resume_text", ""), state.get("parsed_resume"))
    return {**state, "improved_resume": improved.get("improved_content"), "current_step": "resume_improved"}

async def conduct_interview_node(state: InterviewAceState) -> InterviewAceState:
    return {**state, "current_step": "interview_ready"}

async def evaluate_answers_node(state: InterviewAceState) -> InterviewAceState:
    return {**state, "current_step": "answers_evaluated"}

async def generate_career_plan_node(state: InterviewAceState) -> InterviewAceState:
    return {**state, "current_step": "career_planned"}

async def generate_report_node(state: InterviewAceState) -> InterviewAceState:
    return {**state, "current_step": "completed"}
