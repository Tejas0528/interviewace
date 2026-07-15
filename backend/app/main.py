from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import init_db
from app.api.v1 import auth, resume, interview, analytics, career, reports, chatbot
from app.api.v1.websocket import router as ws_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered interview preparation platform",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

prefix = "/api/v1"
app.include_router(auth.router, prefix=prefix)
app.include_router(resume.router, prefix=prefix)
app.include_router(interview.router, prefix=prefix)
app.include_router(analytics.router, prefix=prefix)
app.include_router(career.router, prefix=prefix)
app.include_router(reports.router, prefix=prefix)
app.include_router(chatbot.router, prefix=prefix)
app.include_router(ws_router)


@app.get("/health")
async def health():
    return {"status": "ok", "version": settings.APP_VERSION}

@app.get("/")
async def root():
    return {"name": settings.APP_NAME, "version": settings.APP_VERSION, "docs": "/api/docs"}
