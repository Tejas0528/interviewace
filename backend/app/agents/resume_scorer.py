from app.agents.base_agent import BaseAgent

SYSTEM_PROMPT = """You are a professional resume evaluator with 20 years of HR experience.
Analyze the resume thoroughly and provide a detailed score.
Return ONLY valid JSON:
{
  "overall": 72,
  "grade": "B+",
  "sections": {
    "summary": 70, "experience": 75, "education": 80,
    "skills": 65, "projects": 60, "formatting": 80, "grammar": 85,
    "ats_compatibility": 70, "action_verbs": 65, "keyword_optimization": 60,
    "completeness": 75, "readability": 80, "achievements": 55
  },
  "strengths": ["Strong technical skills section", "Clear job progression"],
  "weaknesses": ["Missing quantified achievements", "Weak professional summary"],
  "suggestions": [
    "Add measurable results to experience bullets (e.g., 'Increased sales by 30%')",
    "Include a compelling professional summary highlighting your unique value",
    "Use stronger action verbs: Led, Architected, Optimized, Delivered",
    "Add certifications relevant to your field",
    "Quantify your project impact with numbers"
  ],
  "missing_sections": ["Certifications", "LinkedIn URL"],
  "action_verb_issues": ["Used 'worked on' instead of 'Led'", "Used 'helped' instead of 'Implemented'"],
  "formatting_issues": ["Inconsistent date formats", "Uneven spacing"],
  "keyword_gaps": ["Docker", "Kubernetes", "Agile", "CI/CD"]
}
All scores 0-100. Be specific and actionable. Return ONLY JSON."""

class ResumeScorerAgent(BaseAgent):
    async def score(self, resume_text: str, parsed_data=None) -> dict:
        context = f"Resume:\n{resume_text[:6000]}"
        if parsed_data:
            context += f"\n\nParsed Data: {str(parsed_data)[:2000]}"
        response = await self.invoke(SYSTEM_PROMPT, f"Score this resume:\n\n{context}")
        result = self.parse_json(response)
        if not result or "overall" not in result:
            return self._default()
        for k in result.get("sections", {}):
            result["sections"][k] = max(0, min(100, result["sections"][k]))
        result["overall"] = max(0, min(100, result.get("overall", 50)))
        return result

    def _default(self):
        return {
            "overall": 60, "grade": "C+",
            "sections": {"summary": 55, "experience": 65, "education": 70, "skills": 60,
                        "projects": 50, "formatting": 65, "grammar": 75, "ats_compatibility": 60,
                        "action_verbs": 55, "keyword_optimization": 50, "completeness": 60,
                        "readability": 70, "achievements": 45},
            "strengths": ["Resume has basic structure"],
            "weaknesses": ["Needs more quantified achievements", "Summary needs improvement"],
            "suggestions": ["Add numbers to your achievements", "Strengthen your professional summary",
                           "Use action verbs at the start of each bullet"],
            "missing_sections": [], "action_verb_issues": [], "formatting_issues": [], "keyword_gaps": []
        }
