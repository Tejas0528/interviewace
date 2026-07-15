from typing import Optional
from app.agents.base_agent import BaseAgent

QUESTION_SYSTEM = """You are a senior interviewer at a top tech company.
Generate a contextual interview question based on the role, type, and conversation history.
Return ONLY valid JSON:
{
  "question": "The interview question",
  "category": "Technical/Behavioral/HR/Situational/System Design",
  "difficulty": "easy/medium/hard",
  "expected_points": ["Key point 1", "Key point 2", "Key point 3"],
  "follow_up": "Potential follow-up question",
  "context": "Why this question is asked in real interviews"
}"""

QUESTION_BANKS = {
    "hr": [
        "Tell me about yourself and walk me through your background.",
        "Why are you interested in this role and our company?",
        "What are your greatest professional strengths?",
        "Describe your biggest weakness and how you're working on it.",
        "Where do you see yourself in 5 years?",
        "Why are you leaving your current position?",
        "What motivates you professionally?",
        "Describe your ideal work environment.",
        "How do you handle stress and tight deadlines?",
        "What's your proudest professional achievement?"
    ],
    "behavioral": [
        "Tell me about a time you handled a difficult team conflict.",
        "Describe a situation where you had to learn something quickly.",
        "Give an example of when you showed leadership without authority.",
        "Tell me about a project that failed. What did you learn?",
        "Describe a time you had to make a decision with incomplete information.",
        "Tell me about your most challenging project and how you managed it.",
        "Give an example of when you went above and beyond your responsibilities.",
        "Describe a time you had to influence someone without direct authority.",
        "Tell me about a time you received critical feedback. How did you respond?",
        "Describe a situation where you had to manage competing priorities."
    ],
    "technical": [
        "Explain the difference between REST and GraphQL APIs.",
        "How would you design a scalable notification system?",
        "What is the difference between SQL and NoSQL databases?",
        "Explain SOLID principles with examples from your experience.",
        "How does garbage collection work in your primary language?",
        "What is the difference between microservices and monolithic architecture?",
        "Explain CAP theorem and when you'd choose consistency vs availability.",
        "How would you optimize a slow database query?",
        "What is your approach to writing testable code?",
        "Explain the concept of eventual consistency."
    ],
    "system_design": [
        "Design a URL shortening service like bit.ly.",
        "How would you design Twitter's feed system?",
        "Design a real-time collaborative document editor.",
        "How would you build a ride-sharing system like Uber?",
        "Design a distributed cache system.",
        "How would you build a payment processing system?",
        "Design an e-commerce checkout system.",
        "How would you architect a video streaming platform?",
    ],
    "situational": [
        "If you had to deliver a project with half the team you need, what would you do?",
        "A key stakeholder is unhappy with the project direction. How do you handle it?",
        "You discover a critical bug right before a major release. What do you do?",
        "Your manager assigns you a task you disagree with. How do you respond?",
        "How would you onboard to a completely new codebase with no documentation?",
    ]
}

class MockInterviewerAgent(BaseAgent):
    async def generate_question(self, job_role: str, interview_type: str, 
                                 question_number: int, company: Optional[str] = None,
                                 previous_questions: list = None) -> dict:
        company_ctx = f" at {company}" if company else ""
        prev_ctx = ""
        if previous_questions:
            prev_ctx = f"\nPrevious questions asked: {', '.join(previous_questions[-3:])}"
        
        prompt = f"""Generate interview question #{question_number + 1} for:
Role: {job_role}{company_ctx}
Interview Type: {interview_type}
Question Number: {question_number + 1} of 10
{prev_ctx}

{"Ask a progressively harder question since this is question " + str(question_number + 1) if question_number > 3 else "Start with a foundational question."}
Make it specific to the role and realistic for real interviews."""

        response = await self.invoke(QUESTION_SYSTEM, prompt)
        result = self.parse_json(response)
        
        if not result or "question" not in result:
            return self._fallback(interview_type, question_number)
        return result

    def _fallback(self, interview_type: str, index: int) -> dict:
        bank_key = interview_type if interview_type in QUESTION_BANKS else "behavioral"
        questions = QUESTION_BANKS[bank_key]
        q = questions[index % len(questions)]
        return {
            "question": q, "category": interview_type.title(),
            "difficulty": "medium" if index < 5 else "hard",
            "expected_points": ["Clear structure", "Specific examples", "Measurable results"],
            "follow_up": "Can you elaborate on the outcome?",
            "context": "This question tests your real-world experience and problem-solving."
        }
