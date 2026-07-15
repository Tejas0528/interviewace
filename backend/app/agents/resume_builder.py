from app.agents.base_agent import BaseAgent

SYSTEM_PROMPT = """You are a world-class resume writer and career coach.
Rewrite the given resume to be exceptional, ATS-friendly, and impactful.

Return ONLY valid JSON:
{
  "improved_content": "FULL improved resume text here with all sections...",
  "changes": [
    "Rewrote professional summary with strong value proposition",
    "Added quantified metrics to all experience bullets",
    "Strengthened action verbs throughout",
    "Reorganized skills section for ATS optimization",
    "Improved project descriptions with impact metrics",
    "Fixed grammar and consistency issues",
    "Added missing keywords for ATS compatibility"
  ],
  "improved_summary": "Rewritten professional summary here...",
  "improved_experience": [
    {"company": "...", "role": "...", "bullets": ["• Led team of 5 engineers to deliver...", "• Reduced load time by 40%..."]}
  ],
  "improved_skills": {"technical": [], "tools": [], "soft": []},
  "ats_score_improvement": 25,
  "keywords_added": ["Docker", "Agile", "CI/CD", "REST API"],
  "sections_improved": ["Summary", "Experience", "Skills", "Projects"]
}
Make it significantly better. Use power words. Quantify everything. Return ONLY JSON."""

class ResumeBuilderAgent(BaseAgent):
    async def improve(self, resume_text: str, parsed_data=None) -> dict:
        context = f"Original Resume:\n{resume_text[:6000]}"
        response = await self.invoke(SYSTEM_PROMPT, f"Improve this resume completely:\n\n{context}")
        result = self.parse_json(response)
        if not result or "improved_content" not in result:
            return {"improved_content": resume_text, "changes": ["Unable to process. Please try again."],
                    "improved_summary": "", "improved_experience": [], "improved_skills": {},
                    "ats_score_improvement": 0, "keywords_added": [], "sections_improved": []}
        return result
