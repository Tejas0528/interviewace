from app.agents.base_agent import BaseAgent

COMPANY_SYSTEM_PROMPT = """You are an expert interview consultant with deep knowledge of tech company hiring processes.
Return ONLY valid JSON:
{
  "company": "Google",
  "culture": "Data-driven, innovation-focused, collaborative engineering culture",
  "rounds": [
    "Resume Screening",
    "Phone Screen (45 min coding)",
    "Technical Interview 1 - Data Structures & Algorithms",
    "Technical Interview 2 - System Design",
    "Behavioral Interview - Googleyness",
    "Team Match"
  ],
  "sample_questions": [
    "Design YouTube's video recommendation system",
    "Implement an LRU cache",
    "Tell me about a time you influenced without authority",
    "Find the kth largest element in an array"
  ],
  "tips": [
    "Practice LeetCode medium/hard problems daily",
    "Master STAR method for behavioral questions",
    "Study Google's Leadership Principles",
    "Prepare system design for large-scale systems",
    "Research the team you're interviewing with"
  ]
}
Return ONLY JSON."""

class RAGRetriever(BaseAgent):
    """RAG-based retriever for company guides and knowledge base content.
    In production this would query ChromaDB for relevant documents.
    """

    async def get_company_guide(self, company: str) -> dict:
        prompt = f"Provide a comprehensive interview guide for: {company}"
        response = await self.invoke(COMPANY_SYSTEM_PROMPT, prompt)
        result = self.parse_json(response)

        if not result or "rounds" not in result:
            return self._default_guide(company)

        return result

    def _default_guide(self, company: str) -> dict:
        return {
            "company": company,
            "culture": "Professional, growth-oriented work environment",
            "rounds": [
                "Application & Resume Screening",
                "HR Phone Screen",
                "Technical Assessment",
                "Technical Interview",
                "Final Round",
            ],
            "sample_questions": [
                "Tell me about yourself",
                "Why do you want to work at this company?",
                "Describe a challenging project you completed",
                "Where do you see yourself in 5 years?",
            ],
            "tips": [
                "Research the company's products and recent news",
                "Prepare 5-6 STAR stories for behavioral questions",
                "Practice coding on a whiteboard or blank IDE",
                "Ask thoughtful questions at the end of each interview",
                "Follow up with a thank you email within 24 hours",
            ],
        }
