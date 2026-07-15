from app.agents.base_agent import BaseAgent
from typing import List

SYSTEM_PROMPT = """You are InterviewAce AI, an expert interview preparation assistant.
You help with:
- Interview questions and answers (HR, Technical, Behavioral)
- Resume writing and optimization
- Career guidance and planning
- Technical concepts (DSA, System Design, React, Python, SQL, etc.)
- Company-specific preparation
- Communication and body language tips
- Salary negotiation strategies
- STAR method and behavioral interviews

Be conversational, encouraging, and specific. Give actionable advice.
Keep responses focused and under 400 words unless more depth is needed."""

# Rich fallback responses when no API key is configured
FALLBACK_RESPONSES = {
    "hi": "Hello! 👋 I'm InterviewAce AI, your personal interview coach. I can help you with:\n\n• **Interview preparation** — HR, behavioral, and technical questions\n• **Resume tips** — ATS optimization, action verbs, formatting\n• **STAR method** — structure your answers perfectly\n• **Company research** — Google, Amazon, Microsoft, and more\n• **Salary negotiation** — get the offer you deserve\n\nWhat would you like to work on today?",
    "how are you": "I'm doing great and ready to help you land your dream job! 🚀\n\nWhat interview challenge can I help you tackle today? Whether it's practicing common questions, improving your resume, or preparing for a specific company — I've got you covered!",
    "star": """**The STAR Method** is the gold standard for behavioral interview answers:

**S — Situation**: Set the scene briefly (1-2 sentences)
*"Our team was facing a critical deadline with a major client..."*

**T — Task**: Your specific responsibility
*"As lead developer, I was responsible for delivering the API..."*

**A — Action**: What YOU did (use "I", not "we")
*"I reorganized the sprint, worked with the team to remove blockers, and personally coded the core module..."*

**R — Result**: Measurable outcome
*"We delivered 2 days early. The client extended our contract by $200K."*

**Pro tip**: Always end with a number — percentage, dollar amount, time saved, or team size. It makes your answer 10x more memorable.""",
    "salary": """**Salary Negotiation Tips** 💰

1. **Never give the first number** — say "I'd like to understand the full package first"
2. **Research first** — use Glassdoor, Levels.fyi, LinkedIn Salary
3. **Give a range** — put your target at the bottom: "I'm looking at ₹12-15 LPA"
4. **Negotiate the whole package** — base, bonus, equity, WFH, learning budget
5. **Get it in writing** — always

**When they ask "What's your current salary?"**
Say: *"I'd prefer to focus on the value I bring to this role. Based on my research, I'm targeting X."*

**Script for counter-offer:**
*"I'm very excited about this opportunity. Based on my experience with [X, Y, Z], would you be able to get closer to [higher number]?"*""",
    "default": "I can help you with interview preparation! Here are some things I can assist with:\n\n• **STAR Method** — How to structure behavioral answers\n• **Common HR Questions** — Tell me about yourself, strengths, weaknesses\n• **Technical Interview Tips** — DSA, System Design approaches\n• **Resume Tips** — ATS optimization, action verbs\n• **Company Guides** — Google, Amazon, TCS, Infosys and more\n• **Salary Negotiation** — Scripts and strategies\n\nJust ask me anything specific and I'll give you detailed guidance!"
}

SUGGESTIONS_MAP = {
    "star": ["Give me a STAR example for leadership", "How to answer 'Tell me about a failure'?", "What are common behavioral questions?"],
    "salary": ["How to negotiate a counter offer?", "What benefits can I negotiate?", "How to research market salary?"],
    "resume": ["How to write a strong summary?", "What action verbs should I use?", "How to quantify achievements?"],
    "technical": ["How to approach system design?", "Tips for DSA interviews?", "What to do when stuck in coding?"],
    "default": ["What is the STAR method?", "How do I negotiate salary?", "Tell me about common HR questions"],
}

def _get_fallback(message: str) -> tuple[str, list]:
    msg = message.lower().strip()
    if any(w in msg for w in ["hi", "hello", "hey", "hii"]):
        return FALLBACK_RESPONSES["hi"], SUGGESTIONS_MAP["default"]
    if any(w in msg for w in ["how are you", "how r you", "how ru"]):
        return FALLBACK_RESPONSES["how are you"], SUGGESTIONS_MAP["default"]
    if any(w in msg for w in ["star", "situation", "behavioral", "behaviour"]):
        return FALLBACK_RESPONSES["star"], SUGGESTIONS_MAP["star"]
    if any(w in msg for w in ["salary", "negotiat", "pay", "ctc", "lpa"]):
        return FALLBACK_RESPONSES["salary"], SUGGESTIONS_MAP["salary"]
    if any(w in msg for w in ["resume", "cv", "ats", "format"]):
        return FALLBACK_RESPONSES["default"], SUGGESTIONS_MAP["resume"]
    if any(w in msg for w in ["technical", "coding", "dsa", "system design", "algorithm"]):
        return FALLBACK_RESPONSES["default"], SUGGESTIONS_MAP["technical"]
    return FALLBACK_RESPONSES["default"], SUGGESTIONS_MAP["default"]

class ChatbotAgent(BaseAgent):
    async def chat(self, message: str, conversation_history: List[dict] = None) -> str:
        # Build context from history
        history_ctx = ""
        if conversation_history:
            recent = conversation_history[-6:]
            for msg in recent:
                role = "User" if msg["role"] == "user" else "Assistant"
                history_ctx += f"{role}: {msg['content'][:300]}\n"

        full_prompt = f"""Previous conversation:
{history_ctx}

Current user message: {message}

Provide a helpful, specific response as InterviewAce AI."""

        response = await self.invoke(SYSTEM_PROMPT, full_prompt)

        # If LLM not available or returned empty, use smart fallback
        if not response or response == "{}":
            fallback, _ = _get_fallback(message)
            return fallback

        return response

    async def get_suggestions(self, message: str) -> List[str]:
        # Always return relevant suggestions even without API key
        _, suggestions = _get_fallback(message)
        return suggestions
