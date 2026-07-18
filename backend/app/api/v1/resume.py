import os
from typing import List, Optional

import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.db_models import User, Resume, ResumeScore, ATSReport
from app.schemas.schemas import ResumeResponse, ResumeScoreResponse, ATSScoreResponse, ResumeImproveResponse
from app.agents.resume_analyzer import ResumeAnalyzerAgent
from app.agents.resume_scorer import ResumeScorerAgent
from app.agents.ats_analyzer import ATSAnalyzerAgent
from app.agents.resume_builder import ResumeBuilderAgent

router = APIRouter(prefix="/resume", tags=["Resume"])


class ATSRequest(BaseModel):
    job_description: Optional[str] = None


async def extract_text(file_path: str, content_type: str) -> str:
    try:
        if "pdf" in content_type:
            import PyPDF2
            with open(file_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                return "\n".join(
                    page.extract_text() or "" for page in reader.pages
                )
        if "word" in content_type or "openxml" in content_type:
            from docx import Document
            doc = Document(file_path)
            return "\n".join(p.text for p in doc.paragraphs if p.text)
    except Exception as e:
        print(f"[extract_text] Failed for {file_path}: {e}")
    return ""


@router.post("/upload", response_model=ResumeResponse, status_code=201)
async def upload_resume(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Resume:
    filename = file.filename or ""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in {"pdf", "doc", "docx"}:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Upload a PDF, DOC, or DOCX.",
        )

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    safe_name = f"{user.id}_{filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_name)

    async with aiofiles.open(file_path, "wb") as out:
        await out.write(await file.read())

    text_content = await extract_text(file_path, file.content_type or "")

    parsed_data: dict = {}
    try:
        analyzer = ResumeAnalyzerAgent()
        parsed_data = await analyzer.parse(text_content) or {}
    except Exception as e:
        print(f"[upload_resume] ResumeAnalyzerAgent failed: {e}")

    resume = Resume(
        user_id=user.id,
        filename=filename,
        file_path=file_path,
        content=text_content,
        parsed_data=parsed_data,
    )
    db.add(resume)
    await db.commit()
    await db.refresh(resume)
    return resume


@router.get("/", response_model=List[ResumeResponse])
async def list_resumes(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> List[Resume]:
    result = await db.execute(
        select(Resume)
        .where(Resume.user_id == user.id)
        .order_by(Resume.created_at.desc())
    )
    return list(result.scalars().all())


@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(
    resume_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Resume:
    result = await db.execute(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id)
    )
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
    return resume


@router.post("/{resume_id}/analyze", response_model=ResumeScoreResponse)
async def analyze_resume(
    resume_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    result = await db.execute(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id)
    )
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    score_data: dict = {}
    try:
        scorer = ResumeScorerAgent()
        score_data = await scorer.score(resume.content or "", resume.parsed_data) or {}
    except Exception as e:
        print(f"[analyze_resume] ResumeScorerAgent failed: {e}")

    if not score_data or "overall" not in score_data:
        score_data = {
            "overall": 50,
            "grade": "C",
            "sections": {
                "summary": 50, "experience": 50, "education": 50,
                "skills": 50, "projects": 50, "formatting": 50,
                "grammar": 50, "ats_compatibility": 50, "achievements": 50,
            },
            "strengths": ["Resume uploaded successfully."],
            "weaknesses": ["AI scoring unavailable. Please try again."],
            "suggestions": ["Ensure your resume has clear sections."],
            "keyword_gaps": [],
        }

    score_record = ResumeScore(
        resume_id=resume.id,
        overall=score_data.get("overall", 50),
        sections=score_data.get("sections", {}),
        suggestions=score_data.get("suggestions", []),
    )
    db.add(score_record)
    await db.commit()
    await db.refresh(score_record)
    return score_data


@router.post("/{resume_id}/ats", response_model=ATSScoreResponse)
async def get_ats_score(
    resume_id: str,
    payload: ATSRequest = ATSRequest(),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    result = await db.execute(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id)
    )
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    ats_data: dict = {}
    try:
        ats_agent = ATSAnalyzerAgent()
        ats_data = await ats_agent.analyze(resume.content or "", payload.job_description) or {}
    except Exception as e:
        print(f"[get_ats_score] ATSAnalyzerAgent failed: {e}")

    if not ats_data or "score" not in ats_data:
        ats_data = {
            "score": 50,
            "keyword_match": 50,
            "formatting_score": 60,
            "action_verbs_score": 50,
            "readability_score": 60,
            "missing_keywords": [],
            "found_keywords": [],
            "suggestions": ["ATS analysis unavailable. Please try again."],
        }

    for key in ("score", "keyword_match", "formatting_score", "action_verbs_score", "readability_score"):
        ats_data[key] = max(0.0, min(100.0, float(ats_data.get(key, 50))))

    ats_record = ATSReport(
        resume_id=resume.id,
        job_description=payload.job_description,
        score=ats_data["score"],
        keyword_match=ats_data["keyword_match"],
        formatting_score=ats_data["formatting_score"],
        action_verbs_score=ats_data["action_verbs_score"],
        readability_score=ats_data["readability_score"],
        missing_keywords=ats_data.get("missing_keywords", []),
        found_keywords=ats_data.get("found_keywords", []),
        suggestions=ats_data.get("suggestions", []),
    )
    db.add(ats_record)
    await db.commit()
    await db.refresh(ats_record)
    return ats_data


@router.post("/{resume_id}/improve", response_model=ResumeImproveResponse)
async def improve_resume(
    resume_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    result = await db.execute(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id)
    )
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    improve_data: dict = {}
    try:
        builder = ResumeBuilderAgent()
        improve_data = await builder.improve(resume.content or "", resume.parsed_data) or {}
    except Exception as e:
        print(f"[improve_resume] ResumeBuilderAgent failed: {e}")

    if not improve_data or "improved_content" not in improve_data:
        improve_data = {
            "improved_content": resume.content or "",
            "changes": ["AI improvement unavailable. Returning original resume."],
            "ats_score_improvement": 0,
            "keywords_added": [],
        }

    return improve_data


@router.get("/{resume_id}/download")
async def download_resume(
    resume_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> FileResponse:
    result = await db.execute(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id)
    )
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
    if not resume.file_path or not os.path.exists(resume.file_path):
        raise HTTPException(status_code=404, detail="Resume file not found on disk.")
    return FileResponse(
        path=resume.file_path,
        filename=resume.filename,
        media_type="application/octet-stream",
    )


@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    result = await db.execute(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id)
    )
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
    if resume.file_path and os.path.exists(resume.file_path):
        try:
            os.remove(resume.file_path)
        except OSError as e:
            print(f"[delete_resume] Could not remove file {resume.file_path}: {e}")
    await db.delete(resume)
    await db.commit()
    return {"message": "Resume deleted successfully"}