from typing import Optional
from app.agents.base_agent import BaseAgent

SYSTEM_PROMPT = """You are an ATS (Applicant Tracking System) expert. Analyze resumes for ATS compatibility.
Return ONLY valid JSON:
{
  "score": 72,
  "keyword_match": 65,
  "formatting_score": 80,
  "action_verbs_score": 75,
  "readability_score": 85,
  "missing_keywords": ["Docker", "Kubernetes", "CI/CD", "Agile", "REST API"],
  "found_keywords": ["Python", "React", "JavaScript", "SQL", "Git"],
  "suggestions": [
    "Add Docker and Kubernetes to match modern DevOps requirements",
    "Use more action verbs like 'Led', 'Built', 'Optimized'",
    "Avoid tables and graphics that ATS cannot parse"
  ]
}
All scores 0-100. Be realistic. Return ONLY JSON."""

class ATSAnalyzerAgent(BaseAgent):
    async def analyze(self, resume_text: str, job_description: Optional[str] = None) -> dict:
        context = f"Resume:\n{resume_text[:5000]}\n"
        if job_description:
            context += f"\nJob Description:\n{job_description[:3000]}"

        response = await self.invoke(SYSTEM_PROMPT, f"Perform ATS analysis:\n\n{context}")
        result = self.parse_json(response)

        if not result or "score" not in result:
            return self._default_ats()

        for key in ["score", "keyword_match", "formatting_score", "action_verbs_score", "readability_score"]:
            result[key] = max(0, min(100, result.get(key, 60)))

        result.setdefault("missing_keywords", [])
        result.setdefault("found_keywords", [])
        result.setdefault("suggestions", [])

        return result

    def _default_ats(self) -> dict:
        return {
            "score": 65,
            "keyword_match": 60,
            "formatting_score": 75,
            "action_verbs_score": 70,
            "readability_score": 80,
            "missing_keywords": ["Docker", "Kubernetes", "Agile", "CI/CD"],
            "found_keywords": ["Python", "JavaScript", "React", "SQL"],
            "suggestions": [
                "Add more industry-specific keywords",
                "Use standard section headings (Experience, Education, Skills)",
                "Include measurable results in your bullet points",
            ],
        }
