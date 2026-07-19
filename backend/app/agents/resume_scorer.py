import re
from app.agents.base_agent import BaseAgent

SYSTEM_PROMPT = """You are a professional resume evaluator with 20 years of HR experience.
Analyze the resume thoroughly and provide a detailed score.
Return ONLY valid JSON:
{
  "overall": 72,
  "grade": "B+",
  "sections": {
    "summary": 70, "experience": 75, "education": 80,
    "skills": 65, "projects": 60, "formatting": 80, "grammar": 85,
    "ats_compatibility": 70, "action_verbs": 65, "keyword_optimization": 60,
    "completeness": 75, "readability": 80, "achievements": 55
  },
  "strengths": ["Strong technical skills section", "Clear job progression"],
  "weaknesses": ["Missing quantified achievements", "Weak professional summary"],
  "suggestions": [
    "Add measurable results to experience bullets",
    "Include a compelling professional summary",
    "Use stronger action verbs: Led, Architected, Optimized, Delivered",
    "Add certifications relevant to your field",
    "Quantify your project impact with numbers"
  ],
  "missing_sections": ["Certifications", "LinkedIn URL"],
  "action_verb_issues": ["Used worked on instead of Led"],
  "formatting_issues": ["Inconsistent date formats"],
  "keyword_gaps": ["Docker", "Kubernetes", "Agile", "CI/CD"]
}
All scores 0-100. Be specific and actionable. Return ONLY JSON."""

# Strong action verbs
ACTION_VERBS = [
    "led","built","created","designed","developed","implemented","architected",
    "optimized","reduced","increased","delivered","deployed","managed","achieved",
    "launched","improved","automated","streamlined","generated","established",
    "coordinated","executed","spearheaded","transformed","engineered","resolved",
    "negotiated","mentored","trained","collaborated","analyzed","exceeded",
]

# ATS-friendly keywords by category
ATS_KEYWORDS = [
    "python","java","javascript","react","node","sql","aws","docker","kubernetes",
    "machine learning","data analysis","project management","agile","scrum","git",
    "communication","leadership","teamwork","problem solving","analytical",
    "excel","tableau","power bi","tensorflow","pytorch","rest api","microservices",
    "ci/cd","devops","cloud","linux","html","css","typescript","spring","django",
]

# Section headings to detect
SECTION_PATTERNS = {
    "summary":       r"(summary|objective|profile|about me|professional summary)",
    "experience":    r"(experience|work history|employment|professional experience|internship)",
    "education":     r"(education|academic|qualification|degree|university|college)",
    "skills":        r"(skills|technical skills|competencies|technologies|tools|expertise)",
    "projects":      r"(projects|portfolio|personal projects|academic projects|key projects)",
    "certifications":r"(certification|certificate|certified|accreditation|credential)",
    "achievements":  r"(achievement|award|honor|recognition|accomplishment)",
    "contact":       r"(email|phone|linkedin|github|contact|@)",
}

def _rule_based_score(text: str, parsed: dict = None) -> dict:
    """
    Fully rule-based scoring — works 100% without Gemini.
    Analyzes actual resume content and returns real scores.
    """
    if not text:
        return _empty_score()

    lower = text.lower()
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    words = lower.split()
    word_count = len(words)
    sections_found = {}

    # ── Detect sections ──────────────────────────────────────────────────────
    for section, pattern in SECTION_PATTERNS.items():
        sections_found[section] = bool(re.search(pattern, lower))

    # ── Contact info ─────────────────────────────────────────────────────────
    has_email    = bool(re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text))
    has_phone    = bool(re.search(r"(\+\d{1,3}[\s-]?)?\(?\d{3,5}\)?[\s.-]?\d{3,5}[\s.-]?\d{3,5}", text))
    has_linkedin = "linkedin" in lower
    has_github   = "github" in lower

    # ── Action verbs ─────────────────────────────────────────────────────────
    action_verb_count = sum(1 for verb in ACTION_VERBS if re.search(rf"\b{verb}\b", lower))
    action_verb_score = min(100, int((action_verb_count / 8) * 100))

    # ── Quantified achievements (numbers in context) ──────────────────────────
    quant_matches = re.findall(
        r"\b(\d+[\+%xX]|\d+\s?(percent|million|billion|lpa|lakh|crore|users|customers|hours|days|weeks|months|years|members|engineers|projects|products))\b",
        lower
    )
    quant_score = min(100, len(quant_matches) * 12)

    # ── ATS keyword density ───────────────────────────────────────────────────
    found_kw    = [kw for kw in ATS_KEYWORDS if kw in lower]
    missing_kw  = [kw for kw in ATS_KEYWORDS[:20] if kw not in lower][:8]
    ats_kw_score = min(100, int((len(found_kw) / 12) * 100))

    # ── Length / completeness ─────────────────────────────────────────────────
    if word_count < 100:
        length_score = 20
    elif word_count < 200:
        length_score = 45
    elif word_count < 350:
        length_score = 65
    elif word_count < 600:
        length_score = 85
    elif word_count <= 900:
        length_score = 100
    else:
        length_score = 75  # Too long

    # ── Section scores ────────────────────────────────────────────────────────
    summary_score = 80 if sections_found["summary"] else 30
    if sections_found["summary"]:
        summary_text = lower[max(0, lower.find("summary")):lower.find("summary")+400]
        if len(summary_text.split()) > 30:
            summary_score = 90
        elif len(summary_text.split()) > 15:
            summary_score = 75

    experience_score = 30
    if sections_found["experience"]:
        exp_lines = [l for l in lines if any(v in l.lower() for v in ["worked","developed","built","led","managed","designed","created","implemented","intern","engineer","developer","analyst"])]
        experience_score = min(100, 50 + len(exp_lines) * 6)

    education_score = 90 if sections_found["education"] else 40

    skills_score = 30
    if sections_found["skills"]:
        skill_lines = [l for l in lines if any(kw in l.lower() for kw in ATS_KEYWORDS)]
        skills_score = min(100, 50 + len(skill_lines) * 8 + ats_kw_score // 4)

    projects_score = 30
    if sections_found["projects"]:
        proj_lines = [l for l in lines if any(w in l.lower() for w in ["built","developed","created","designed","implemented","github","deployed","flask","django","react","python"])]
        projects_score = min(100, 55 + len(proj_lines) * 7)

    cert_score = 85 if sections_found["certifications"] else 40

    # ── Formatting ────────────────────────────────────────────────────────────
    formatting_score = 60
    if has_email: formatting_score += 10
    if has_phone: formatting_score += 5
    if has_linkedin: formatting_score += 10
    if has_github: formatting_score += 5
    formatting_score = min(100, formatting_score)

    # ── Grammar proxy (very long lines → possible formatting issue) ───────────
    long_lines = [l for l in lines if len(l) > 200]
    grammar_score = max(60, 95 - len(long_lines) * 5)

    # ── ATS compatibility ─────────────────────────────────────────────────────
    ats_score = int((ats_kw_score * 0.5) + (action_verb_score * 0.3) + (formatting_score * 0.2))
    ats_score = max(30, min(100, ats_score))

    # ── Readability ───────────────────────────────────────────────────────────
    avg_line_length = sum(len(l) for l in lines) / max(len(lines), 1)
    readability_score = 90 if avg_line_length < 80 else 70 if avg_line_length < 120 else 55

    # ── Completeness ─────────────────────────────────────────────────────────
    section_count = sum(1 for v in sections_found.values() if v)
    completeness_score = min(100, int((section_count / 7) * 100))

    # ── Overall (weighted average) ────────────────────────────────────────────
    overall = int(
        summary_score     * 0.10 +
        experience_score  * 0.20 +
        education_score   * 0.10 +
        skills_score      * 0.15 +
        projects_score    * 0.10 +
        formatting_score  * 0.08 +
        grammar_score     * 0.05 +
        ats_score         * 0.10 +
        action_verb_score * 0.07 +
        quant_score       * 0.05
    )
    overall = max(20, min(98, overall))

    # ── Grade ────────────────────────────────────────────────────────────────
    if overall >= 90: grade = "A+"
    elif overall >= 85: grade = "A"
    elif overall >= 80: grade = "A-"
    elif overall >= 75: grade = "B+"
    elif overall >= 70: grade = "B"
    elif overall >= 65: grade = "B-"
    elif overall >= 60: grade = "C+"
    elif overall >= 55: grade = "C"
    else: grade = "D"

    # ── Strengths ────────────────────────────────────────────────────────────
    strengths = []
    if action_verb_count >= 5: strengths.append(f"Good use of {action_verb_count} action verbs (Led, Built, Developed...)")
    if len(quant_matches) >= 2: strengths.append(f"Has {len(quant_matches)} quantified achievements with numbers")
    if has_email and has_phone: strengths.append("Complete contact information (email + phone)")
    if has_linkedin: strengths.append("LinkedIn profile included — great for ATS")
    if has_github: strengths.append("GitHub profile included — shows technical credibility")
    if sections_found["projects"]: strengths.append("Projects section present — adds credibility")
    if sections_found["certifications"]: strengths.append("Certifications section present")
    if len(found_kw) >= 8: strengths.append(f"Good keyword coverage — {len(found_kw)} relevant keywords found")
    if word_count >= 300: strengths.append(f"Good resume length ({word_count} words)")
    if not strengths: strengths = ["Resume has basic structure — good starting point"]

    # ── Weaknesses ───────────────────────────────────────────────────────────
    weaknesses = []
    if len(quant_matches) < 2: weaknesses.append("Missing quantified achievements — add numbers, percentages, impact")
    if not sections_found["summary"]: weaknesses.append("No professional summary — add a 3-line pitch at the top")
    if action_verb_count < 4: weaknesses.append(f"Weak action verbs — only {action_verb_count} found, aim for 8+")
    if not has_linkedin: weaknesses.append("No LinkedIn URL — add it for ATS and recruiter visibility")
    if not has_github and any(kw in lower for kw in ["python","java","react","developer","engineer","code"]): weaknesses.append("No GitHub link — important for tech roles")
    if not sections_found["certifications"]: weaknesses.append("No certifications — add relevant ones to boost credibility")
    if word_count < 250: weaknesses.append(f"Resume too short ({word_count} words) — aim for 400-700 words")
    if len(missing_kw) > 4: weaknesses.append(f"Missing important keywords: {', '.join(missing_kw[:5])}")
    if not weaknesses: weaknesses = ["Resume is well-structured — focus on quantifying more achievements"]

    # ── Suggestions ──────────────────────────────────────────────────────────
    suggestions = []
    if len(quant_matches) < 3:
        suggestions.append("Add numbers to every bullet: 'Increased sales by 35%', 'Reduced load time by 2s', 'Managed team of 5'")
    if not sections_found["summary"]:
        suggestions.append("Add a 3-line Professional Summary at the top: Role + Years + Key Achievement + Goal")
    if action_verb_count < 6:
        suggestions.append("Start every bullet point with a strong action verb: Led, Built, Architected, Optimized, Delivered, Reduced")
    if not has_linkedin:
        suggestions.append("Add your LinkedIn URL — most ATS systems and recruiters check this")
    if len(missing_kw) > 3:
        suggestions.append(f"Add these missing keywords naturally in your content: {', '.join(missing_kw[:6])}")
    if not sections_found["certifications"]:
        suggestions.append("Add certifications section — even online certs (Google, AWS, Coursera) boost ATS scores")
    if not sections_found["projects"]:
        suggestions.append("Add a Projects section — describe 2-3 projects with tech stack and measurable results")
    if word_count < 300:
        suggestions.append("Expand your resume — add more detail to experience and projects sections")
    suggestions.append("Use a clean single-column format — no tables, no graphics, for better ATS parsing")

    # ── Formatting issues ─────────────────────────────────────────────────────
    formatting_issues = []
    if not has_email: formatting_issues.append("Email address missing from resume")
    if not has_phone: formatting_issues.append("Phone number missing from resume")
    if long_lines: formatting_issues.append(f"{len(long_lines)} lines are too long — keep bullets under 2 lines")

    # ── Action verb issues ────────────────────────────────────────────────────
    weak_verbs = []
    for weak, strong in [("worked on","Led/Built"),("helped","Implemented/Supported"),
                          ("responsible for","Managed/Owned"),("was involved","Contributed"),
                          ("did","Executed/Delivered"),("made","Created/Designed")]:
        if weak in lower:
            weak_verbs.append(f"Replace '{weak}' with '{strong}'")

    return {
        "overall": overall,
        "grade": grade,
        "sections": {
            "summary":              summary_score,
            "experience":           experience_score,
            "education":            education_score,
            "skills":               skills_score,
            "projects":             projects_score,
            "formatting":           formatting_score,
            "grammar":              grammar_score,
            "ats_compatibility":    ats_score,
            "action_verbs":         action_verb_score,
            "keyword_optimization": ats_kw_score,
            "completeness":         completeness_score,
            "readability":          readability_score,
            "achievements":         quant_score,
        },
        "strengths":         strengths[:5],
        "weaknesses":        weaknesses[:5],
        "suggestions":       suggestions[:7],
        "missing_sections":  [s for s, found in sections_found.items() if not found and s not in ["contact"]],
        "action_verb_issues":weak_verbs[:4],
        "formatting_issues": formatting_issues,
        "keyword_gaps":      missing_kw[:8],
    }


def _empty_score() -> dict:
    return {
        "overall": 30, "grade": "D",
        "sections": {k: 30 for k in ["summary","experience","education","skills","projects",
                                       "formatting","grammar","ats_compatibility","action_verbs",
                                       "keyword_optimization","completeness","readability","achievements"]},
        "strengths": ["File uploaded successfully"],
        "weaknesses": ["Resume text could not be extracted — check file format"],
        "suggestions": ["Ensure your PDF/DOCX has selectable text (not a scanned image)"],
        "missing_sections": list(SECTION_PATTERNS.keys()),
        "action_verb_issues": [], "formatting_issues": ["Could not parse resume content"], "keyword_gaps": [],
    }


class ResumeScorerAgent(BaseAgent):
    async def score(self, resume_text: str, parsed_data: dict = None) -> dict:
        # Always run rule-based first — instant and accurate
        rule_result = _rule_based_score(resume_text, parsed_data)

        # If Gemini is available, enhance with AI
        try:
            context = f"Resume:\n{resume_text[:6000]}"
            response = await self.invoke(SYSTEM_PROMPT, f"Score this resume:\n\n{context}")
            ai_result = self.parse_json(response)

            if ai_result and "overall" in ai_result and isinstance(ai_result["overall"], (int, float)):
                # Blend: 60% AI + 40% rule-based for robustness
                for key in ai_result.get("sections", {}):
                    if key in rule_result["sections"]:
                        ai_val = ai_result["sections"][key]
                        rb_val = rule_result["sections"][key]
                        ai_result["sections"][key] = int(ai_val * 0.6 + rb_val * 0.4)

                blended_overall = int(
                    float(ai_result.get("overall", rule_result["overall"])) * 0.6 +
                    rule_result["overall"] * 0.4
                )
                ai_result["overall"] = max(20, min(98, blended_overall))
                ai_result["grade"] = rule_result["grade"]

                # Keep rule-based keyword/formatting analysis
                ai_result["keyword_gaps"] = rule_result["keyword_gaps"]
                ai_result["formatting_issues"] = rule_result["formatting_issues"]
                ai_result["action_verb_issues"] = (
                    ai_result.get("action_verb_issues") or rule_result["action_verb_issues"]
                )
                return ai_result
        except Exception as e:
            print(f"[ResumeScorerAgent] Gemini unavailable, using rule-based: {e}")

        return rule_result
