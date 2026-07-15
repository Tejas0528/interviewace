"""
Planner Agent — Top-level orchestrator for the InterviewAce workflow.
Decides which agents to invoke and in what order based on user context.
"""
from app.agents.base_agent import BaseAgent

SYSTEM_PROMPT = """You are the master planner for an AI interview coaching platform.
Given a user's goal, determine the optimal workflow and return a JSON plan.

Return ONLY valid JSON:
{
  "workflow": ["resume_analysis", "ats_analysis", "resume_improvement", "interview_prep", "mock_interview", "feedback", "career_plan", "report"],
  "priority": "interview_prep",
  "estimated_minutes": 45,
  "message": "I'll start by analyzing your resume, then guide you through interview preparation.",
  "skip": []
}

Possible workflow steps:
- resume_analysis: Parse and score the resume
- ats_analysis: Check ATS compatibility
- resume_improvement: Suggest/rewrite resume
- interview_prep: Teach interview concepts
- mock_interview: Conduct a practice interview
- feedback: Evaluate mock interview answers
- career_plan: Generate career roadmap
- report: Generate PDF report

Return ONLY JSON."""


class PlannerAgent(BaseAgent):
    async def plan(self, user_goal: str, has_resume: bool = False) -> dict:
        context = f"""
User goal: {user_goal}
Has resume uploaded: {has_resume}
"""
        response = await self.invoke(SYSTEM_PROMPT, context)
        plan = self.parse_json(response)

        if not plan or "workflow" not in plan:
            return self._default_plan(has_resume)

        return plan

    def _default_plan(self, has_resume: bool) -> dict:
        workflow = []
        if has_resume:
            workflow = ["resume_analysis", "ats_analysis", "mock_interview", "feedback", "report"]
        else:
            workflow = ["interview_prep", "mock_interview", "feedback", "career_plan"]

        return {
            "workflow": workflow,
            "priority": "mock_interview",
            "estimated_minutes": 30,
            "message": "Let's start your interview preparation journey!",
            "skip": [],
        }
