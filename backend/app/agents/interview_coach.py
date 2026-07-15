from app.agents.base_agent import BaseAgent

SYSTEM_PROMPT = """You are a world-class interview coach with 20+ years of experience.
Provide comprehensive, actionable interview coaching content.
Return ONLY valid JSON:
{
  "topic": "Topic name",
  "overview": "2-3 paragraph overview of this interview topic",
  "key_concepts": ["concept1", "concept2", "concept3"],
  "theory": "Detailed theory and explanation (3-4 paragraphs)",
  "examples": [
    {
      "question": "Example interview question",
      "best_answer": "Model answer that would impress an interviewer",
      "wrong_answer": "Common bad answer to avoid",
      "why_good": "Why the best answer works",
      "why_bad": "Why the wrong answer fails"
    }
  ],
  "tips": ["Tip 1: ...", "Tip 2: ...", "Tip 3: ..."],
  "common_mistakes": ["Mistake 1: ...", "Mistake 2: ..."],
  "practice_questions": [
    {"question": "...", "category": "...", "difficulty": "easy/medium/hard", "hint": "..."}
  ],
  "recruiter_mindset": "What recruiters are actually looking for when they ask these questions",
  "body_language_tips": ["Maintain eye contact", "Sit upright"],
  "preparation_checklist": ["Research company", "Prepare STAR stories"],
  "resources": ["Book: Cracking the Coding Interview", "Video: TED Talk on confidence"]
}
Be thorough, specific, and practical. Return ONLY JSON."""

TOPICS_MAP = {
    "hr-questions": "HR Interview Questions - Background, motivation, culture fit",
    "behavioral": "Behavioral Interview Questions using STAR method",
    "star-method": "The STAR Method - Situation, Task, Action, Result framework",
    "technical": "Technical Interview Questions - DSA, System Design, Coding",
    "communication": "Communication Skills for Interviews",
    "body-language": "Body Language and Non-verbal Communication in Interviews",
    "salary-negotiation": "Salary Negotiation Strategies and Tactics",
    "situational": "Situational Interview Questions",
    "resume-discussion": "How to Discuss Your Resume in Interviews",
    "tell me about yourself": "Tell Me About Yourself - The Perfect Pitch",
    "strengths and weaknesses": "Answering Strengths and Weaknesses Questions",
    "why this company": "Why Do You Want to Work Here - Company Research Questions",
}

class InterviewCoachAgent(BaseAgent):
    async def get_learning_content(self, topic: str) -> dict:
        topic_context = TOPICS_MAP.get(topic.lower(), topic)
        prompt = f"""Create comprehensive interview coaching content for:
Topic: {topic_context}

Include detailed theory, multiple real examples with good and bad answers,
specific tips, common mistakes, 5+ practice questions, and recruiter mindset."""
        
        response = await self.invoke(SYSTEM_PROMPT, prompt)
        result = self.parse_json(response)
        
        if not result or "theory" not in result:
            return {
                "topic": topic,
                "overview": f"Master {topic} with this comprehensive guide.",
                "key_concepts": ["Preparation", "Practice", "Delivery"],
                "theory": f"This section covers everything you need to know about {topic} in interviews.",
                "examples": [{"question": f"Common {topic} question", "best_answer": "Structured, specific answer with examples",
                              "wrong_answer": "Vague, unprepared response", "why_good": "Shows preparation",
                              "why_bad": "Shows lack of preparation"}],
                "tips": ["Prepare specific examples", "Practice out loud", "Research the company"],
                "common_mistakes": ["Being too vague", "Not having examples ready"],
                "practice_questions": [{"question": f"Tell me about your experience with {topic}", 
                                       "category": topic, "difficulty": "medium", "hint": "Use STAR method"}],
                "recruiter_mindset": "Recruiters want to see self-awareness, preparation, and cultural fit.",
                "body_language_tips": ["Maintain eye contact", "Smile naturally", "Sit upright"],
                "preparation_checklist": ["Research company", "Prepare 3-5 STAR stories", "Practice answers"],
                "resources": ["Cracking the PM Interview", "TED Talks on confidence"]
            }
        return result

    async def get_quiz(self, topic: str) -> dict:
        prompt = f"""Create a 5-question quiz about {topic} for interview preparation.
Return ONLY valid JSON:
{{
  "quiz": [
    {{
      "question": "Question text",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correct": "A",
      "explanation": "Why A is correct"
    }}
  ]
}}"""
        response = await self.invoke("You are an interview quiz creator. Return ONLY valid JSON.", prompt)
        result = self.parse_json(response)
        return result if result else {"quiz": []}
