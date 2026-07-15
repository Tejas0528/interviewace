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
async def upload_resume(file: UploadFile = File(...), db: AsyncSession = Depends(get_db),
                        user: User = Depends(get_current_user)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    ext = file.filename.split(".")[-1].lower()
    if ext not in ["pdf", "doc", "docx"]:
        raise HTTPException(status_code=400, detail="Only PDF and Word documents are supported")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, f"{user.id}_{file.filename}")

    async with aiofiles.open(file_path, "wb") as f:
        content = await file.read()
        await f.write(content)

    text_content = await extract_text(file_path, file.content_type or "")

    if not text_content.strip():
        raise HTTPException(status_code=422, 
            detail="Could not extract text from file. Please ensure it's a valid PDF or DOCX with readable text.")

    from app.agents.resume_analyzer import ResumeAnalyzerAgent
    analyzer = ResumeAnalyzerAgent()
    parsed = await analyzer.parse(text_content)

    resume = Resume(
        user_id=user.id, filename=file.filename, file_path=file_path,
        content=text_content, parsed_data=parsed,
    )
    db.add(resume)
    await db.commit()
    await db.refresh(resume)
    return resume

@router.get("/", response_model=List[ResumeResponse])
async def list_resumes(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Resume).where(Resume.user_id == user.id).order_by(Resume.created_at.desc()))
    return result.scalars().all()

@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(resume_id: str, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id))
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume

@router.post("/{resume_id}/analyze", response_model=ResumeScoreResponse)
async def analyze_resume(resume_id: str, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id))
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    from app.agents.resume_scorer import ResumeScorerAgent
    scorer = ResumeScorerAgent()
    score_data = await scorer.score(resume.content or "", resume.parsed_data)

    score = ResumeScore(
        resume_id=resume.id, overall=score_data["overall"],
        sections=score_data["sections"], suggestions=score_data["suggestions"],
    )
    db.add(score)
    await db.commit()
    return score_data

@router.post("/{resume_id}/ats", response_model=ATSScoreResponse)
async def get_ats_score(resume_id: str, payload: ATSRequest = ATSRequest(),
                        db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id))
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    from app.agents.ats_analyzer import ATSAnalyzerAgent
    ats_agent = ATSAnalyzerAgent()
    ats_data = await ats_agent.analyze(resume.content or "", payload.job_description)

    ats = ATSReport(resume_id=resume.id, job_description=payload.job_description, **ats_data)
    db.add(ats)
    await db.commit()
    return ats_data

@router.post("/{resume_id}/improve", response_model=ResumeImproveResponse)
async def improve_resume(resume_id: str, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id))
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    from app.agents.resume_builder import ResumeBuilderAgent
    builder = ResumeBuilderAgent()
    return await builder.improve(resume.content or "", resume.parsed_data)

@router.get("/{resume_id}/download/{format}")
async def download_resume(resume_id: str, format: str, db: AsyncSession = Depends(get_db),
                          user: User = Depends(get_current_user)):
    """Download improved resume as PDF or DOCX."""
    result = await db.execute(select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id))
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    from app.agents.resume_builder import ResumeBuilderAgent
    builder = ResumeBuilderAgent()
    improved = await builder.improve(resume.content or "", resume.parsed_data)
    content = improved.get("improved_content", resume.content or "")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    if format == "pdf":
        file_path = os.path.join(settings.UPLOAD_DIR, f"improved_{resume.id}.pdf")
        await _generate_resume_pdf(content, file_path, resume.parsed_data)
        return FileResponse(file_path, media_type="application/pdf", filename=f"resume_improved.pdf")
    elif format == "docx":
        file_path = os.path.join(settings.UPLOAD_DIR, f"improved_{resume.id}.docx")
        await _generate_resume_docx(content, file_path, resume.parsed_data)
        return FileResponse(file_path, 
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            filename=f"resume_improved.docx")
    else:
        raise HTTPException(status_code=400, detail="Format must be 'pdf' or 'docx'")

async def _generate_resume_pdf(content: str, file_path: str, parsed_data: dict = None):
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
    from reportlab.lib.units import inch

    doc = SimpleDocTemplate(file_path, pagesize=letter, topMargin=0.6*inch, bottomMargin=0.6*inch)
    styles = getSampleStyleSheet()
    story = []

    name_style = ParagraphStyle("Name", parent=styles["Title"], fontSize=20, 
                                textColor=colors.HexColor("#1e293b"))
    section_style = ParagraphStyle("Section", parent=styles["Heading2"], fontSize=13,
                                   textColor=colors.HexColor("#6366f1"), spaceBefore=10, spaceAfter=4)
    body_style = ParagraphStyle("Body", parent=styles["Normal"], fontSize=10, leading=14)

    if parsed_data and parsed_data.get("name"):
        story.append(Paragraph(parsed_data["name"], name_style))
        contact_parts = [v for v in [parsed_data.get("email"), parsed_data.get("phone"), 
                                     parsed_data.get("location")] if v]
        if contact_parts:
            story.append(Paragraph(" | ".join(contact_parts), body_style))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#6366f1")))
        story.append(Spacer(1, 0.15*inch))

    # Render content with basic formatting
    for line in content.split("\n"):
        line = line.strip()
        if not line:
            story.append(Spacer(1, 4))
            continue
        if line.isupper() and len(line) < 40:
            story.append(Paragraph(line, section_style))
        else:
            story.append(Paragraph(line.replace("•", "&bull;"), body_style))

    doc.build(story)

async def _generate_resume_docx(content: str, file_path: str, parsed_data: dict = None):
    from docx import Document
    from docx.shared import Pt, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH

    doc = Document()
    
    if parsed_data and parsed_data.get("name"):
        title = doc.add_heading(parsed_data["name"], level=0)
        contact_parts = [v for v in [parsed_data.get("email"), parsed_data.get("phone"),
                                     parsed_data.get("location")] if v]
        if contact_parts:
            p = doc.add_paragraph(" | ".join(contact_parts))
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    for line in content.split("\n"):
        line = line.strip()
        if not line:
            continue
        if line.isupper() and len(line) < 40:
            doc.add_heading(line, level=1)
        else:
            doc.add_paragraph(line)

    doc.save(file_path)

@router.delete("/{resume_id}", status_code=204)
async def delete_resume(resume_id: str, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id))
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    if os.path.exists(resume.file_path):
        os.remove(resume.file_path)
    await db.delete(resume)
    await db.commit()
