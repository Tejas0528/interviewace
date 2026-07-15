# 🚀 InterviewAce AI

> **Prepare. Practice. Perform. Get Hired.**

An AI-powered Interview Preparation Platform built with **LangGraph**, **RAG**, **FastAPI**, **React 19**, and **PostgreSQL**.

---

## ✨ Features

| Feature | Status |
|---|---|
| Resume Upload & Parsing | ✅ |
| Resume Score (AI) | ✅ |
| ATS Score Analysis | ✅ |
| Resume Improvement (AI) | ✅ |
| Mock Interview (AI) | ✅ |
| Real-time Answer Feedback | ✅ |
| Interview Learning Hub | ✅ |
| Company-specific Guides | ✅ |
| Career Roadmap Generator | ✅ |
| PDF Report Downloads | ✅ |
| Analytics Dashboard | ✅ |
| JWT Authentication | ✅ |
| LangGraph Multi-Agent | ✅ |

---

## 🏗️ Tech Stack

**Frontend**: React 19, TypeScript, Vite, TailwindCSS, Framer Motion, Recharts, Zustand, TanStack Query

**Backend**: Python, FastAPI, LangGraph, LangChain, SQLAlchemy, PostgreSQL, Redis

**AI**: Google Gemini 1.5 Flash / OpenAI GPT-4

**Infrastructure**: Docker, Nginx, ChromaDB

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- A Google Gemini API key (free at [ai.google.dev](https://ai.google.dev))

### 1. Clone & Configure

```bash
git clone <repo-url>
cd interviewace
cp .env.example .env
```

Edit `.env`:
```env
SECRET_KEY=your-32-char-secret-key-here
GOOGLE_API_KEY=your-google-gemini-api-key
```

### 2. Launch with Docker

```bash
docker-compose up -d
```

### 3. Access the App

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/api/docs |

---

## 🔧 Local Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start PostgreSQL and Redis
docker-compose up db redis -d

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🤖 AI Agents

| Agent | Purpose |
|---|---|
| **ResumeAnalyzerAgent** | Parse resume into structured data |
| **ResumeScorerAgent** | Score resume quality (0-100) |
| **ATSAnalyzerAgent** | ATS compatibility analysis |
| **ResumeBuilderAgent** | AI-powered resume improvement |
| **MockInterviewerAgent** | Generate contextual interview questions |
| **FeedbackAgent** | Evaluate and score answers |
| **InterviewCoachAgent** | Generate learning content |
| **CareerCoachAgent** | Build personalized career roadmaps |
| **ReportGeneratorAgent** | Generate PDF reports |

---

## 📁 Project Structure

```
interviewace/
├── frontend/              # React 19 + TypeScript app
│   ├── src/
│   │   ├── api/           # Axios API clients
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── stores/        # Zustand state stores
│   │   └── types/         # TypeScript types
│   └── Dockerfile
├── backend/               # FastAPI Python app
│   ├── app/
│   │   ├── agents/        # LangGraph AI agents
│   │   ├── api/v1/        # FastAPI routers
│   │   ├── core/          # Config, DB, Security
│   │   ├── graph/         # LangGraph workflow
│   │   ├── models/        # SQLAlchemy models
│   │   ├── rag/           # RAG retrieval system
│   │   └── schemas/       # Pydantic schemas
│   └── Dockerfile
├── docker-compose.yml
├── nginx.conf
└── .env.example
```

---

## 🔑 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` — Register
- `POST /api/v1/auth/login` — Login (returns JWT)
- `POST /api/v1/auth/refresh` — Refresh token
- `GET  /api/v1/auth/me` — Get current user

### Resume
- `POST /api/v1/resume/upload` — Upload resume (PDF/DOCX)
- `GET  /api/v1/resume/` — List resumes
- `POST /api/v1/resume/{id}/analyze` — Get resume score
- `POST /api/v1/resume/{id}/ats` — Get ATS score
- `POST /api/v1/resume/{id}/improve` — AI improve resume

### Interview
- `POST /api/v1/interview/sessions` — Start session
- `GET  /api/v1/interview/sessions/{id}/next-question` — Get question
- `POST /api/v1/interview/sessions/{id}/answer` — Submit answer
- `POST /api/v1/interview/sessions/{id}/complete` — End session
- `GET  /api/v1/interview/learn/{topic}` — Get learning content
- `GET  /api/v1/interview/company/{company}` — Company guide

### Analytics & Career
- `GET  /api/v1/analytics/dashboard` — Dashboard data
- `POST /api/v1/career/roadmap/generate` — Generate roadmap
- `GET  /api/v1/reports/` — List reports
- `GET  /api/v1/reports/{id}/download` — Download PDF

---

## 🐳 Production Deployment

```bash
# Set production environment
export SECRET_KEY=$(openssl rand -hex 32)
export GOOGLE_API_KEY=your-key

# Build and deploy
docker-compose -f docker-compose.yml up -d --build

# Run database migrations
docker-compose exec backend alembic upgrade head
```

---

## 📄 License

MIT License — Built with ❤️ by InterviewAce AI Team
