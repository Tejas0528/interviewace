import os
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.core.config import settings
from app.models.db_models import User, Resume, ResumeScore, ATSReport
from app.schemas.schemas import ResumeResponse, ResumeScoreResponse, ATSScoreResponse, ResumeImproveResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/resume", tags=["Resume"])

class ATSRequest(BaseModel):
    job_description: Optional[str] = None

async def extract_text(file_path: str, content_type: str) -> str:
    try:
        if "pdf" in content_type:
            import PyPDF2
            with open(file_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                return "\n".join(p.extract_text() or "" for p in reader.pages)
        elif "word" in content_type or "openxml" in content_type:
            from docx import Document
            doc = Document(file_path)
            return "\n".join(p.text for p in doc.paragraphs if p.text)
    except Exception as e:
        print(f"Text extraction error: {e}")
    return ""

@router.post("/upload", response_model=ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    ext = file.filename.split(".")[-1].lower()
    if ext not in ["pdf", "doc", "docx"]:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and Word documents are supported",
        )

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, f"{user.id}_{file.filename}")

    async with aiofiles.open(file_path, "wb") as f:
        content = await file.read()
        await f.write(content)

    text_content = await extract_text(file_path, file.content_type or "")

    if not text_content.strip():
        raise HTTPException(
            status_code=422,
            detail="Could not extract text from file."
        )

    parsed = {}

    try:
        from app.agents.resume_analyzer import ResumeAnalyzerAgent

        analyzer = ResumeAnalyzerAgent()
        parsed = await analyzer.parse(text_content)

    except Exception as e:
        print(f"Resume parser failed: {e}")
        parsed = {}

    resume = Resume(
        user_id=user.id,
        filename=file.filename,
        file_path=file_path,
        content=text_content,
        parsed_data=parsed,
    )

    db.add(resume)
    await db.commit()
    await db.refresh(resume)

    return resume