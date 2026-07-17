import json
import re
from typing import Optional

class BaseAgent:
    """Base class for all InterviewAce AI agents."""

    def __init__(self):
        self._llm = None

    def _get_llm(self):
        if self._llm is None:
            from app.core.config import settings
            if settings.GOOGLE_API_KEY and settings.GOOGLE_API_KEY.strip():
                try:
                    from langchain_google_genai import ChatGoogleGenerativeAI
                    self._llm = ChatGoogleGenerativeAI(
                        model="gemini-1.5-flash",
                        google_api_key=settings.GOOGLE_API_KEY.strip(),
                        temperature=0.7,
                    )
                except Exception as e:
                    print(f"[BaseAgent] Failed to init Gemini LLM: {e}")
            else:
                print("[BaseAgent] WARNING: GOOGLE_API_KEY not set — AI features disabled, using fallbacks")
        return self._llm

    async def invoke(self, system_prompt: str, user_message: str) -> str:
        llm = self._get_llm()
        if not llm:
            return "{}"
        try:
            from langchain_core.messages import HumanMessage, SystemMessage
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_message),
            ]
            import asyncio

try:
    response = await asyncio.wait_for(
        llm.ainvoke(messages),
        timeout=15
    )
    return response.content
except Exception as e:
    print(f"[BaseAgent] LLM invoke error: {e}")
    return "{}"
            return response.content
        except Exception as e:
            print(f"[BaseAgent] LLM invoke error: {e}")
            return "{}"

    def parse_json(self, text: str) -> dict:
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if match:
            text = match.group(1)
        match = re.search(r"(\{[\s\S]*\}|\[[\s\S]*\])", text)
        if match:
            text = match.group(1)
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return {}
