from typing import Optional, List
from app.agents.base_agent import BaseAgent

SYSTEM_PROMPT = """You are an expert interview coach evaluating candidate answers.
Provide detailed, constructive, and specific feedback.
Return ONLY valid JSON:
{
  "score": 7.5,
  "grade": "B+",
  "feedback": "Detailed 3-4 sentence feedback on the answer quality, what was good, what was missing.",
  "strengths": ["Used specific example", "Clear structure", "Quantified the result"],
  "improvements": ["Add more context to the situation", "Mention team size", "Include timeline"],
  "star_method_used": true,
  "star_breakdown": {"situation": true, "task": true, "action": true, "result": false},
  "communication_score": 8,
  "technical_accuracy": 7,
  "confidence_indicators": ["Used assertive language", "Clear and direct"],
  "keywords_used": ["leadership", "collaboration"],
  "missing_keywords": ["metrics", "outcome", "deadline"],
  "model_answer_hint": "A stronger answer would include specific metrics like 'reduced load time by 40%'",
  "next_focus": "Focus on quantifying your results in the next answer"
}
Score is 0-10. Be encouraging but honest. Return ONLY JSON."""

class FeedbackAgent(BaseAgent):
    async def evaluate_answer(self, question: str, answer: str, category: str,
                               expected_points: Optional[List[str]] = None) -> dict:
        context = f"""Question: {question}
Category: {category}
Candidate Answer: {answer[:3000]}"""
        if expected_points:
            context += f"\nExpected Key Points: {', '.join(expected_points)}"

        response = await self.invoke(SYSTEM_PROMPT, f"Evaluate this interview answer:\n\n{context}")
        result = self.parse_json(response)

        if not result or "feedback" not in result:
            return {
                "score": 6.0, "grade": "C+",
                "feedback": "Your answer addressed the question but could be more specific. Use the STAR method to structure behavioral answers with clear Situation, Task, Action, and Result.",
                "strengths": ["Understood the question"],
                "improvements": ["Add specific examples", "Quantify your results", "Use STAR structure"],
                "star_method_used": False,
                "star_breakdown": {"situation": False, "task": False, "action": True, "result": False},
                "communication_score": 6, "technical_accuracy": 6,
                "confidence_indicators": [], "keywords_used": [], "missing_keywords": [],
                "model_answer_hint": "Structure your answer: Situation → Task → Action → Result with numbers.",
                "next_focus": "Practice using the STAR method for your next answer"
            }
        result["score"] = max(0, min(10, float(result.get("score", 6))))
        return result

    async def generate_final_report(self, session_data: dict) -> dict:
        prompt = f"""Analyze this complete mock interview session and generate a comprehensive report.
Session Data: {str(session_data)[:4000]}

Return ONLY valid JSON:
{{
  "overall_score": 75,
  "overall_grade": "B",
  "performance_summary": "2-3 paragraph summary of overall performance",
  "scores": {{
    "technical_accuracy": 75,
    "communication": 80,
    "confidence": 72,
    "behavioral": 78,
    "star_method": 70,
    "professionalism": 85,
    "problem_solving": 73
  }},
  "strong_areas": ["Communication", "Technical knowledge"],
  "weak_areas": ["Quantifying results", "System design depth"],
  "top_improvements": [
    "Practice quantifying your achievements with specific numbers",
    "Prepare 3-4 detailed STAR stories for behavioral questions",
    "Study system design concepts for senior-level questions"
  ],
  "recommended_resources": [
    {{"title": "Cracking the Coding Interview", "type": "book", "focus": "Technical"}},
    {{"title": "STAR Method Practice", "type": "practice", "focus": "Behavioral"}}
  ],
  "interview_readiness": "70% - Ready for mid-level positions, need more preparation for senior roles",
  "next_steps": ["Schedule 2 more mock interviews", "Practice SQL queries", "Review system design"]
}}"""
        response = await self.invoke("You are an expert interview coach generating detailed reports. Return ONLY JSON.", prompt)
        result = self.parse_json(response)
        return result if result else {}
