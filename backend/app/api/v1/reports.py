import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from pydantic import BaseModel
from app.core.database import get_db
from app.models.db_models import User, Report, InterviewSession
from app.schemas.schemas import ReportResponse
from app.api.deps import get_current_user
from app.agents.report_generator import ReportGeneratorAgent

router = APIRouter(prefix="/reports", tags=["Reports"])

class GenerateReportRequest(BaseModel):
    type: str
    source_id: str

@router.get("/", response_model=List[ReportResponse])
async def list_reports(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Report).where(Report.user_id == user.id).order_by(Report.created_at.desc()))
    reports = result.scalars().all()
    return [ReportResponse(
        id=r.id, type=r.type, title=r.title, summary=r.summary,
        created_at=r.created_at, download_url=f"/api/v1/reports/{r.id}/download"
    ) for r in reports]

@router.post("/generate", response_model=ReportResponse, status_code=201)
async def generate_report(payload: GenerateReportRequest, db: AsyncSession = Depends(get_db),
                          user: User = Depends(get_current_user)):
    generator = ReportGeneratorAgent()
    
    # Gather source data for the report
    source_data = {}
    if payload.type == "interview":
        result = await db.execute(select(InterviewSession).where(
            InterviewSession.id == payload.source_id, InterviewSession.user_id == user.id))
        session = result.scalar_one_or_none()
        if session and session.scores:
            source_data = session.scores
    
    result = await generator.generate(payload.type, payload.source_id, user.id, source_data)

    report = Report(
        user_id=user.id, type=payload.type,
        title=result["title"], summary=result["summary"], file_path=result["file_path"],
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)

    return ReportResponse(
        id=report.id, type=report.type, title=report.title, summary=report.summary,
        created_at=report.created_at, download_url=f"/api/v1/reports/{report.id}/download"
    )

@router.get("/{report_id}/download")
async def download_report(report_id: str, db: AsyncSession = Depends(get_db),
                          user: User = Depends(get_current_user)):
    result = await db.execute(select(Report).where(
        Report.id == report_id, Report.user_id == user.id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if not report.file_path or not os.path.exists(report.file_path):
        raise HTTPException(status_code=404, detail="Report file not found")
    return FileResponse(report.file_path, media_type="application/pdf",
                        filename=f"{report.title.replace(' ', '_')}.pdf")
