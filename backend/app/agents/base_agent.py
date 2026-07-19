import json
import re


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
                print("[BaseAgent] WARNING: GOOGLE_API_KEY not set")

        return self._llm

    async def invoke(self, system_prompt: str, user_message: str) -> str:
        llm = self._get_llm()
        if not llm:
            return "{}"

        try:
            import asyncio
            from langchain_core.messages import HumanMessage, SystemMessage

            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_message),
            ]

            response = await asyncio.wait_for(
                llm.ainvoke(messages),
                timeout=15,
            )

            return response.content

        except Exception as e:
            print(f"[BaseAgent] LLM invoke error: {e}")
            return "{}"

def parse_json(self, text: str) -> dict:
    """
    Robust JSON parser for Gemini responses.
    """

    if not text:
        return {}

    text = text.strip()

    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?", "", text)
        text = re.sub(r"```$", "", text)
        text = text.strip()

    try:
        return json.loads(text)
    except Exception:
        pass

    start = text.find("{")
    end = text.rfind("}")

    if start != -1 and end != -1:
        try:
            return json.loads(text[start:end + 1])
        except Exception:
            pass

    return {}