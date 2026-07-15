from app.agents.base_agent import BaseAgent

SYSTEM_PROMPT = """You are an expert on tech company interview processes with insider knowledge.
Generate comprehensive, accurate company interview guides.
Return ONLY valid JSON:
{
  "company": "Google",
  "overview": "2-3 paragraph company overview including culture, mission, and what makes it unique",
  "culture": "Engineering culture description",
  "difficulty": "Very Hard",
  "rating": 4.5,
  "hiring_process": {
    "duration": "4-8 weeks",
    "stages": ["Resume Screen", "Recruiter Call", "Phone Screen", "Onsite Interviews", "Team Match", "Offer"],
    "description": "Detailed hiring process description"
  },
  "interview_rounds": [
    {"round": 1, "name": "Recruiter Screen", "duration": "30 min", "type": "HR",
     "focus": "Background, motivation, compensation", "tips": "Be enthusiastic, research the company"}
  ],
  "resume_tips": ["Tailor for each application", "Quantify achievements", "Use relevant keywords"],
  "required_skills": {
    "must_have": ["Data Structures", "Algorithms", "System Design"],
    "good_to_have": ["Distributed Systems", "Cloud", "Leadership"],
    "company_specific": ["Googleyness", "Leadership Principles"]
  },
  "salary_range": {
    "junior": "$90K - $140K",
    "mid": "$140K - $200K",
    "senior": "$200K - $350K+",
    "currency": "USD",
    "source": "Levels.fyi estimate"
  },
  "preparation_timeline": {
    "12_weeks": "Full preparation path",
    "8_weeks": "Intensive preparation",
    "4_weeks": "Crash course"
  },
  "behavioral_questions": [
    {"question": "Tell me about a time you influenced without authority", "why_asked": "Tests leadership",
     "tips": "Use STAR method, focus on cross-functional collaboration"}
  ],
  "technical_questions": [
    {"question": "Implement an LRU Cache", "category": "Data Structures", "difficulty": "Medium",
     "expected_approach": "Use HashMap + Doubly Linked List, O(1) operations"}
  ],
  "system_design_questions": [
    {"question": "Design Google Search", "level": "Senior", "focus": "Scale, indexing, ranking"}
  ],
  "coding_focus": ["Arrays", "Trees", "Graphs", "Dynamic Programming", "System Design"],
  "interview_experience": "Based on recent interviews: focus heavily on coding and system design. Culture fit is crucial.",
  "ai_tips": [
    "Study Google's products deeply - you'll discuss them in interviews",
    "Practice explaining your thinking process clearly",
    "Prepare stories that demonstrate Googleyness"
  ],
  "learning_videos": [
    {"title": "Google Interview Prep Guide", "channel": "TechLead", "duration": "45 min",
     "url": "https://youtube.com/watch?v=example", "thumbnail": "https://img.youtube.com/vi/example/0.jpg"}
  ],
  "recent_trends": ["More emphasis on coding quality", "ML/AI questions for ML roles", "Leadership at all levels"],
  "faqs": [
    {"question": "How many rounds does Google have?", "answer": "Typically 4-6 rounds including phone screen and onsite"}
  ],
  "dos": ["Research Google products", "Practice coding out loud", "Ask clarifying questions"],
  "donts": ["Don't rush to code", "Don't ignore testing", "Don't forget to communicate"]
}
Be comprehensive and accurate. Return ONLY JSON."""

COMPANY_CONTEXTS = {
    "google": "Google (Alphabet Inc.) - Search, Cloud, YouTube, Android, DeepMind",
    "amazon": "Amazon - E-commerce, AWS, Alexa, Prime. Known for 16 Leadership Principles.",
    "microsoft": "Microsoft - Azure, Office 365, GitHub, Xbox, LinkedIn. Growth mindset culture.",
    "meta": "Meta - Facebook, Instagram, WhatsApp, Oculus. Moving fast, social impact.",
    "apple": "Apple - iPhone, Mac, iOS, Services. Extreme attention to detail and design.",
    "netflix": "Netflix - Streaming, content creation. Culture of Freedom and Responsibility.",
    "zoho": "Zoho Corporation - SaaS products, CRM, productivity tools. India-based tech giant.",
    "infosys": "Infosys - IT services, consulting, digital transformation. Tier 1 Indian IT company.",
    "tcs": "TCS (Tata Consultancy Services) - IT services, largest Indian IT company.",
    "wipro": "Wipro - IT, BPO, digital services. Major Indian IT company.",
    "accenture": "Accenture - Consulting, technology, outsourcing. Global professional services.",
    "cognizant": "Cognizant - IT services, consulting, BPO. US-headquartered, major India presence.",
}

class CompanyPreparationAgent(BaseAgent):
    async def get_guide(self, company: str) -> dict:
        company_ctx = COMPANY_CONTEXTS.get(company.lower(), company)
        prompt = f"""Generate a COMPREHENSIVE interview guide for: {company_ctx}

Include all sections: overview, hiring process, all interview rounds with specific questions,
behavioral questions with tips, technical questions with approaches, system design questions,
salary ranges, preparation timeline, dos/donts, and recent interview trends.
Make it detailed enough to fully prepare a candidate."""

        response = await self.invoke(SYSTEM_PROMPT, prompt)
        result = self.parse_json(response)
        return result if result and "interview_rounds" in result else self._default(company)

    def _default(self, company: str) -> dict:
        return {
            "company": company,
            "overview": f"{company} is a leading technology company known for innovation and technical excellence.",
            "culture": "Fast-paced, collaborative, and results-driven engineering culture.",
            "difficulty": "Hard", "rating": 4.0,
            "hiring_process": {"duration": "4-6 weeks",
                "stages": ["Resume Screen", "HR Call", "Technical Assessment", "Technical Interview", "Final Round"],
                "description": "Multi-stage process evaluating technical skills and culture fit."},
            "interview_rounds": [
                {"round": 1, "name": "HR Screen", "duration": "30 min", "type": "HR",
                 "focus": "Background, motivation, compensation", "tips": "Be enthusiastic and research the company"},
                {"round": 2, "name": "Technical Interview", "duration": "60 min", "type": "Technical",
                 "focus": "DSA, problem-solving", "tips": "Think out loud, test your code"},
                {"round": 3, "name": "Final Round", "duration": "90 min", "type": "Mixed",
                 "focus": "System design, behavioral", "tips": "Prepare STAR stories"}
            ],
            "resume_tips": ["Tailor resume to job description", "Quantify all achievements", "Use industry keywords"],
            "required_skills": {"must_have": ["Data Structures", "Problem Solving", "Communication"],
                               "good_to_have": ["System Design", "Cloud"], "company_specific": ["Domain knowledge"]},
            "salary_range": {"junior": "Varies by location", "mid": "Varies by location", "senior": "Varies by location",
                            "currency": "USD", "source": "Glassdoor/LinkedIn"},
            "preparation_timeline": {"12_weeks": "Ideal preparation time", "8_weeks": "Good preparation",
                                    "4_weeks": "Minimum recommended"},
            "behavioral_questions": [
                {"question": "Tell me about yourself", "why_asked": "Icebreaker and background check",
                 "tips": "2-minute structured pitch covering background, skills, and why this role"},
                {"question": "Why do you want to work here?", "why_asked": "Tests company research and motivation",
                 "tips": "Research company products, mission, and recent news"}
            ],
            "technical_questions": [
                {"question": "Implement a function to reverse a linked list", "category": "Data Structures",
                 "difficulty": "Easy", "expected_approach": "Iterative with prev/curr/next pointers"},
                {"question": "Find the longest substring without repeating characters", "category": "Strings",
                 "difficulty": "Medium", "expected_approach": "Sliding window with hash set"}
            ],
            "system_design_questions": [
                {"question": f"Design a key feature of {company}'s core product", "level": "Mid-Senior",
                 "focus": "Scalability and reliability"}
            ],
            "coding_focus": ["Arrays", "Strings", "Trees", "Dynamic Programming"],
            "interview_experience": "Focus on communication and structured problem-solving approach.",
            "ai_tips": ["Research company thoroughly", "Practice coding problems daily",
                       "Prepare 5-6 STAR behavioral stories"],
            "learning_videos": [],
            "recent_trends": ["More focus on practical coding", "System design for experienced candidates"],
            "faqs": [{"question": "How long is the interview process?",
                     "answer": "Typically 2-6 weeks depending on the role and team."}],
            "dos": ["Research the company", "Practice coding out loud", "Ask clarifying questions"],
            "donts": ["Don't rush to code", "Don't ignore edge cases", "Don't forget to test your solution"]
        }
