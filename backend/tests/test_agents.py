"""
Unit tests for AI agents (mocked LLM calls).
Run: pytest tests/test_agents.py -v
"""
import pytest
from unittest.mock import AsyncMock, patch


class TestResumeAnalyzerAgent:
    @pytest.fixture
    def agent(self):
        from app.agents.resume_analyzer import ResumeAnalyzerAgent
        return ResumeAnalyzerAgent()

    async def test_parse_empty_resume(self, agent):
        result = await agent.parse("")
        assert isinstance(result, dict)
        assert "skills" in result
        assert isinstance(result["skills"], list)

    async def test_parse_returns_dict(self, agent):
        with patch.object(agent, "invoke", new=AsyncMock(return_value="""
        {
          "name": "John Doe",
          "email": "john@example.com",
          "skills": ["Python", "React"],
          "education": [],
          "experience": [],
          "projects": [],
          "certifications": [],
          "achievements": []
        }
        """)):
            result = await agent.parse("John Doe Python developer...")
            assert result["name"] == "John Doe"
            assert "Python" in result["skills"]


class TestResumeScorerAgent:
    @pytest.fixture
    def agent(self):
        from app.agents.resume_scorer import ResumeScorerAgent
        return ResumeScorerAgent()

    async def test_default_score_structure(self, agent):
        with patch.object(agent, "invoke", new=AsyncMock(return_value="{}")):
            result = await agent.score("some resume text")
            assert "overall" in result
            assert "sections" in result
            assert "suggestions" in result
            assert 0 <= result["overall"] <= 100

    async def test_score_clamped(self, agent):
        with patch.object(agent, "invoke", new=AsyncMock(return_value="""
        {
          "overall": 150,
          "sections": {
            "summary": -10, "experience": 200, "education": 80,
            "skills": 70, "projects": 60, "formatting": 50, "grammar": 90
          },
          "suggestions": []
        }
        """)):
            result = await agent.score("resume")
            assert result["overall"] == 100
            assert result["sections"]["summary"] == 0
            assert result["sections"]["experience"] == 100


class TestATSAnalyzerAgent:
    @pytest.fixture
    def agent(self):
        from app.agents.ats_analyzer import ATSAnalyzerAgent
        return ATSAnalyzerAgent()

    async def test_default_ats_structure(self, agent):
        with patch.object(agent, "invoke", new=AsyncMock(return_value="{}")):
            result = await agent.analyze("resume text")
            assert "score" in result
            assert "missing_keywords" in result
            assert "found_keywords" in result
            assert isinstance(result["missing_keywords"], list)


class TestFeedbackAgent:
    @pytest.fixture
    def agent(self):
        from app.agents.feedback_agent import FeedbackAgent
        return FeedbackAgent()

    async def test_feedback_structure(self, agent):
        with patch.object(agent, "invoke", new=AsyncMock(return_value="""
        {
          "score": 7.5,
          "feedback": "Good answer with clear structure.",
          "strengths": ["Used STAR method"],
          "improvements": ["Add more metrics"],
          "star_method_used": true
        }
        """)):
            result = await agent.evaluate_answer(
                question="Tell me about yourself",
                answer="I am a developer...",
                category="HR",
            )
            assert 0 <= result["score"] <= 10
            assert "feedback" in result

    async def test_score_clamped_to_10(self, agent):
        with patch.object(agent, "invoke", new=AsyncMock(return_value='{"score": 99, "feedback": "great"}')):
            result = await agent.evaluate_answer("q", "a", "HR")
            assert result["score"] <= 10
