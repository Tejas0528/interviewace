from app.agents.base_agent import BaseAgent

SYSTEM_PROMPT = """You are an expert resume parser. Extract ALL information from the resume.
Return ONLY valid JSON with this exact structure:
{
  "name": "Full Name or null",
  "email": "email or null",
  "phone": "phone or null",
  "location": "city, country or null",
  "linkedin": "url or null",
  "github": "url or null",
  "summary": "professional summary or null",
  "education": [{"institution":"","degree":"","field":"","start_date":"","end_date":"","gpa":"","achievements":[]}],
  "experience": [{"company":"","role":"","start_date":"","end_date":"","description":["bullet1"],"technologies":[]}],
  "skills": {"technical":[],"soft":[],"languages":[],"tools":[],"frameworks":[]},
  "projects": [{"name":"","description":"","technologies":[],"url":"","highlights":[]}],
  "certifications": [{"name":"","issuer":"","date":"","url":""}],
  "achievements": [],
  "publications": [],
  "languages": [],
  "volunteer": []
}
Return ONLY the JSON object, nothing else."""

class ResumeAnalyzerAgent(BaseAgent):
    async def parse(self, resume_text: str) -> dict:
        if not resume_text or not resume_text.strip():
            return self._empty()
        response = await self.invoke(SYSTEM_PROMPT, f"Parse this resume completely:\n\n{resume_text[:8000]}")
        parsed = self.parse_json(response)
        return parsed if parsed else self._empty()

    def _empty(self) -> dict:
        return {
            "name": None, "email": None, "phone": None, "location": None,
            "linkedin": None, "github": None, "summary": None,
            "education": [], "experience": [],
            "skills": {"technical": [], "soft": [], "languages": [], "tools": [], "frameworks": []},
            "projects": [], "certifications": [], "achievements": [],
            "publications": [], "languages": [], "volunteer": []
        }
