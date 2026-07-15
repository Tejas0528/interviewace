.PHONY: help dev build up down logs seed migrate frontend backend clean

help:
	@echo "InterviewAce AI - Available Commands"
	@echo "====================================="
	@echo "make dev         - Start full stack in development mode"
	@echo "make up          - Start all Docker services"
	@echo "make down        - Stop all Docker services"
	@echo "make build       - Build Docker images"
	@echo "make logs        - View Docker logs"
	@echo "make seed        - Seed database with demo data"
	@echo "make migrate     - Run database migrations"
	@echo "make frontend    - Start frontend dev server"
	@echo "make backend     - Start backend dev server"
	@echo "make clean       - Remove containers and volumes"

# Docker commands
up:
	docker-compose up -d

down:
	docker-compose down

build:
	docker-compose build

logs:
	docker-compose logs -f

clean:
	docker-compose down -v --remove-orphans

# Database
migrate:
	cd backend && alembic upgrade head

migrate-create:
	cd backend && alembic revision --autogenerate -m "$(name)"

seed:
	cd backend && python seed.py

# Development servers
frontend:
	cd frontend && npm run dev

backend:
	cd backend && uvicorn app.main:app --reload --port 8000

# Full local dev (requires tmux or run in separate terminals)
dev:
	@echo "Start these in separate terminals:"
	@echo "  Terminal 1: make backend"
	@echo "  Terminal 2: make frontend"
	@echo "  Docker:     docker-compose up db redis chromadb -d"

# Install dependencies
install-frontend:
	cd frontend && npm install

install-backend:
	cd backend && pip install -r requirements.txt

# Lint / Format
format:
	cd backend && black app/ && isort app/
	cd frontend && npx prettier --write src/
