from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.api.deps import get_current_user
from app.models.db_models import User
from app.agents.chatbot_agent import ChatbotAgent

router = APIRouter(prefix="/chat", tags=["Chatbot"])

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    response: str
    suggestions: List[str] = []

@router.post("/", response_model=ChatResponse)
async def chat(payload: ChatRequest, user: User = Depends(get_current_user)):
    agent = ChatbotAgent()
    history = [{"role": m.role, "content": m.content} for m in (payload.history or [])]
    response = await agent.chat(payload.message, history)
    suggestions = await agent.get_suggestions(payload.message)
    return ChatResponse(response=response, suggestions=suggestions)
