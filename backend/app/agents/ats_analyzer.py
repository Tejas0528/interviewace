import re
from typing import Optional
from app.agents.base_agent import BaseAgent

SYSTEM_PROMPT = """You are an ATS (Applicant Tracking System) expert.
Analyze the resume for ATS compatibility and return ONLY valid JSON:
{
  "score": 72,
  "keyword_match": 65,
  "formatting_score": 80,
  "action_verbs_score": 75,
  "readability_score": 85,
  "missing_keywords": ["Docker", "Agile", "CI/CD"],
  "found_keywords": ["Python", "SQL", "React"],
  "suggestions": ["Add missing keywords", "Use standard headings", "Remove tables"]
}
All scores 0-100. Return ONLY JSON."""

TECH_KEYWORDS = [
    "python","java","javascript","typescript","react","angular","vue","node","nodejs",
    "sql","mysql","postgresql","mongodb","redis","elasticsearch","nosql",
    "aws","azure","gcp","cloud","docker","kubernetes","terraform","ansible",
    "machine learning","deep learning","tensorflow","pytorch","scikit-learn","pandas","numpy",
    "git","github","gitlab","ci/cd","jenkins","github actions","devops",
    "rest","api","microservices","graphql","grpc","kafka","rabbitmq",
    "html","css","tailwind","bootstrap","scss","sass",
    "linux","bash","shell","unix","windows server",
    "agile","scrum","kanban","jira","confluence","trello",
    "data analysis","data science","tableau","power bi","excel","matplotlib","seaborn",
    "spring","django","flask","fastapi","express","laravel","rails",
    "android","ios","flutter","kotlin","swift","react native",
    "selenium","junit","pytest","testing","tdd","bdd",
    "networking","tcp/ip","http","https","dns","vpn","firewall",
    "blockchain","cybersecurity","ethical hacking","penetration testing",
]

SOFT_KEYWORDS = [
    "leadership","communication","teamwork","collaboration","problem solving",
    "analytical","critical thinking","time management","project management",
    "presentation","stakeholder","cross-functional","mentoring","training",
]

BUSINESS_KEYWORDS = [
    "marketing","sales","finance","accounting","human resources","operations",
    "strategy","business development","customer service","product management",
    "supply chain","logistics","procurement","consulting","banking","investment",
]

ACTION_VERBS_ATS = [
    "led","built","created","designed","developed","implemented","architected",
    "optimized","reduced","increased","delivered","deployed","managed","achieved",
    "launched","improved","automated","streamlined","generated","established",
    "coordinated","executed","spearheaded","transformed","engineered","resolved",
    "negotiated","mentored","trained","analyzed","exceeded","accelerated",
    "collaborated","drove","facilitated","initiated","oversaw","produced",
]

ATS_UNFRIENDLY = [
    "table","<table","column","header","footer","text box","image","photo",
    "graphic","chart","infographic","watermark","border","background color",
]

GOOD_SECTION_HEADERS = [
    "summary","objective","experience","education","skills","projects",
    "certifications","achievements","awards","publications","languages",
    "volunteer","references","contact","profile","work history","employment",
]


def _rule_based_ats(resume_text: str, job_description: Optional[str] = None) -> dict:
    if not resume_text:
        return _empty_ats()

    lower = resume_text.lower()
    lines = [l.strip() for l in resume_text.split("\n") if l.strip()]

    # ── Keyword matching ───────────────────────────────────────────────────────
    all_keywords = TECH_KEYWORDS + SOFT_KEYWORDS + BUSINESS_KEYWORDS
    found_kw = [kw for kw in all_keywords if kw in lower]
    missing_kw = [kw for kw in all_keywords if kw not in lower]

    # If job description provided, prioritize JD keywords
    jd_found = []
    jd_missing = []
    if job_description:
        jd_lower = job_description.lower()
        jd_words = set(re.findall(r"\b[a-z][a-z+#.\-]{1,20}\b", jd_lower))
        resume_words = set(re.findall(r"\b[a-z][a-z+#.\-]{1,20}\b", lower))
        jd_found = list(jd_words & resume_words)[:15]
        jd_missing = list(jd_words - resume_words)[:12]
        keyword_match = min(100, int((len(jd_found) / max(len(jd_words), 1)) * 100))
    else:
        keyword_match = min(100, int((len(found_kw) / 15) * 100))

    # ── Action verbs ───────────────────────────────────────────────────────────
    verb_count = sum(1 for v in ACTION_VERBS_ATS if re.search(rf"\b{v}\b", lower))
    action_verbs_score = min(100, int((verb_count / 8) * 100))

    # ── Formatting score ───────────────────────────────────────────────────────
    formatting_score = 70
    unfriendly_count = sum(1 for u in ATS_UNFRIENDLY if u in lower)
    formatting_score -= unfriendly_count * 10

    has_standard_headers = sum(1 for h in GOOD_SECTION_HEADERS if h in lower)
    formatting_score += min(25, has_standard_headers * 4)

    has_email = bool(re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", resume_text))
    has_phone = bool(re.search(r"(\+\d{1,3}[\s-]?)?\(?\d{3,5}\)?[\s.-]?\d{3,5}[\s.-]?\d{3,5}", resume_text))
    if has_email: formatting_score += 3
    if has_phone: formatting_score += 2
    formatting_score = max(20, min(100, formatting_score))

    # ── Readability score ──────────────────────────────────────────────────────
    avg_line = sum(len(l) for l in lines) / max(len(lines), 1)
    bullet_count = sum(1 for l in lines if l.startswith(("•", "-", "*", "·", "–")))
    readability_score = 70
    if avg_line < 80: readability_score += 15
    elif avg_line < 120: readability_score += 5
    if bullet_count >= 5: readability_score += 10
    readability_score = max(30, min(100, readability_score))

    # ── Overall ATS score (weighted) ──────────────────────────────────────────
    overall = int(
        keyword_match     * 0.40 +
        formatting_score  * 0.25 +
        action_verbs_score * 0.20 +
        readability_score  * 0.15
    )
    overall = max(20, min(97, overall))

    # ── Build display lists ────────────────────────────────────────────────────
    display_found = (jd_found[:12] if job_description else found_kw[:12])
    display_missing = (jd_missing[:8] if job_description else missing_kw[:8])

    # ── Suggestions ───────────────────────────────────────────────────────────
    suggestions = []
    if keyword_match < 60:
        suggestions.append(f"Add these missing keywords naturally: {', '.join(display_missing[:5])}")
    if action_verbs_score < 60:
        suggestions.append("Start bullet points with strong action verbs: Led, Built, Optimized, Delivered, Reduced")
    if unfriendly_count > 0:
        suggestions.append("Remove tables, columns, and graphics — ATS systems cannot parse them")
    if not has_standard_headers >= 4:
        suggestions.append("Use standard section headings: Summary, Experience, Education, Skills, Projects")
    if bullet_count < 5:
        suggestions.append("Use bullet points for experience bullets — easier for ATS to parse")
    if job_description and len(jd_missing) > 5:
        suggestions.append(f"Your resume is missing {len(jd_missing)} keywords from the job description — tailor it")
    if not has_email:
        suggestions.append("Add your email address to the resume")
    suggestions.append("Save resume as a clean .docx or single-column PDF for best ATS results")
    suggestions.append("Avoid headers/footers for contact info — ATS often skips them")

    return {
        "score":              overall,
        "keyword_match":      keyword_match,
        "formatting_score":   formatting_score,
        "action_verbs_score": action_verbs_score,
        "readability_score":  readability_score,
        "found_keywords":     display_found,
        "missing_keywords":   display_missing,
        "suggestions":        suggestions[:7],
    }


def _empty_ats() -> dict:
    return {
        "score": 20, "keyword_match": 0, "formatting_score": 50,
        "action_verbs_score": 0, "readability_score": 50,
        "found_keywords": [], "missing_keywords": [],
        "suggestions": ["Could not parse resume text — ensure file has selectable text"],
    }


class ATSAnalyzerAgent(BaseAgent):
    async def analyze(self, resume_text: str, job_description: Optional[str] = None) -> dict:
        # Always run rule-based first
        rule_result = _rule_based_ats(resume_text, job_description)

        # Try Gemini enhancement
        try:
            ctx = f"Resume:\n{resume_text[:5000]}"
            if job_description:
                ctx += f"\n\nJob Description:\n{job_description[:2000]}"
            response = await self.invoke(SYSTEM_PROMPT, ctx)
            ai_result = self.parse_json(response)

            if ai_result and "score" in ai_result:
                # Blend 60% AI + 40% rule-based
                for key in ["score", "keyword_match", "formatting_score", "action_verbs_score", "readability_score"]:
                    ai_val = float(ai_result.get(key, rule_result[key]))
                    rb_val = float(rule_result[key])
                    ai_result[key] = round(max(0, min(100, ai_val * 0.6 + rb_val * 0.4)), 1)

                # Keep rule-based keyword lists if AI returns empty
                if not ai_result.get("found_keywords"):
                    ai_result["found_keywords"] = rule_result["found_keywords"]
                if not ai_result.get("missing_keywords"):
                    ai_result["missing_keywords"] = rule_result["missing_keywords"]
                if not ai_result.get("suggestions"):
                    ai_result["suggestions"] = rule_result["suggestions"]
                return ai_result
        except Exception as e:
            print(f"[ATSAnalyzerAgent] Gemini unavailable, using rule-based: {e}")

        return rule_result
