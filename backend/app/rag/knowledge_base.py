"""
RAG Knowledge Base - in-memory implementation (no ChromaDB required).
ChromaDB can be added later for production scale.
"""
from typing import List

KNOWLEDGE_BASE = {
    "resume_guide": """
Resume Writing Guide: Use strong action verbs. Quantify achievements.
Example: "Built REST APIs serving 1M+ daily requests" beats "Worked on backend."
Include: Summary, Experience, Skills, Education, Projects.
ATS tip: Mirror keywords from the job description exactly.
""",
    "star_method": """
STAR Method for behavioral interviews:
S - Situation: Set the context briefly.
T - Task: Describe your specific responsibility.
A - Action: Explain what YOU did (use "I" not "we").
R - Result: Share measurable outcomes (numbers, percentages).
Example: "Led migration reducing latency by 40%, saving $50K/year."
""",
    "technical_guide": """
Technical Interview Tips:
- Think out loud during problem solving.
- Ask clarifying questions before starting.
- Discuss time/space complexity.
- Test your solution with edge cases.
- Know: Arrays, Trees, Graphs, DP, System Design.
Common patterns: Two Pointers, Sliding Window, BFS/DFS, Binary Search.
""",
    "hr_guide": """
HR Interview Tips:
- Tell me about yourself: 2-min pitch covering background, skills, why this role.
- Strengths: Pick 3 relevant to the job with examples.
- Weaknesses: Be honest, show self-awareness and improvement steps.
- Why this company: Research products, culture, recent news.
- Salary: Research market rate, give a range based on data.
""",
}


class KnowledgeBaseLoader:
    def __init__(self):
        self.documents = KNOWLEDGE_BASE

    async def load_all(self):
        return True

    async def search(self, query: str, n_results: int = 3) -> List[str]:
        return self._simple_search(query, n_results)

    def _simple_search(self, query: str, n: int = 3) -> List[str]:
        query_lower = query.lower()
        matches = []
        for content in self.documents.values():
            if any(word in content.lower() for word in query_lower.split()):
                matches.append(content.strip())
                if len(matches) >= n:
                    break
        return matches or list(self.documents.values())[:n]
