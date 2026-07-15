from typing import List, Optional
from app.agents.base_agent import BaseAgent

SYSTEM_PROMPT = """You are an elite career coach. Generate a comprehensive, realistic, actionable career roadmap.
Return ONLY valid JSON:
{
  "current_role": "Current Role",
  "target_role": "Target Role",
  "target_company": "Dream Company or null",
  "timeline_months": 12,
  "readiness_score": 55,
  "gap_analysis": {
    "skill_gaps": ["Skill 1", "Skill 2"],
    "experience_gaps": ["Gap 1"],
    "knowledge_gaps": ["Gap 1"]
  },
  "monthly_plan": [
    {"month": 1, "focus": "Foundation", "goals": ["Goal 1"], "tasks": ["Task 1"], "milestone": "Milestone 1"}
  ],
  "milestones": [
    {"title": "Milestone title", "timeline": "Month 1-3", "description": "What to achieve", "deliverables": ["Item 1"], "resources": ["Resource 1"]}
  ],
  "recommended_courses": [
    {"title": "Course title", "platform": "Platform", "url": "https://example.com", "duration": "4 weeks", "level": "beginner", "cost": "Free", "priority": "High", "reason": "Why this course"}
  ],
  "recommended_projects": [
    {"title": "Project title", "description": "What to build", "technologies": ["Tech1"], "difficulty": "Intermediate", "estimated_time": "3 weeks", "impact": "High"}
  ],
  "certifications": [
    {"name": "Cert name", "provider": "Provider", "duration": "1 month", "cost": "$100", "priority": "High", "url": "https://example.com"}
  ],
  "books": [
    {"title": "Book title", "author": "Author", "focus": "Topic", "priority": "Must Read"}
  ],
  "weekly_schedule": {
    "monday": "Activity (2h)",
    "tuesday": "Activity (2h)",
    "wednesday": "Activity (2h)",
    "thursday": "Activity (1h)",
    "friday": "Activity (1.5h)",
    "weekend": "Activity (3h)"
  },
  "networking_tips": ["Tip 1", "Tip 2"],
  "application_strategy": "Strategy description",
  "salary_expectation": "Range based on market",
  "skills_to_learn": ["Skill 1", "Skill 2"],
  "skills_to_strengthen": ["Skill 1", "Skill 2"]
}
Return ONLY valid JSON, nothing else."""

class CareerCoachAgent(BaseAgent):
    async def generate_roadmap(
        self,
        current_role: str,
        target_role: str,
        experience_years: int,
        skills: List[str],
        target_company: Optional[str] = None,
        timeline_months: int = 12,
    ) -> dict:
        company_ctx = f"\nDream Company: {target_company}" if target_company else ""
        skills_ctx = ', '.join(skills) if skills else "Not specified"

        prompt = f"""Generate a complete career roadmap:
Current Role: {current_role}
Target Role: {target_role}{company_ctx}
Years of Experience: {experience_years}
Current Skills: {skills_ctx}
Desired Timeline: {timeline_months} months

Create a detailed plan with specific resources, projects, certifications, and weekly schedule.
Be realistic about the timeline and specific about technologies."""

        response = await self.invoke(SYSTEM_PROMPT, prompt)
        result = self.parse_json(response)

        if result and "milestones" in result and len(result["milestones"]) > 0:
            return result

        # Rich fallback — always returns complete roadmap
        return self._build_fallback(current_role, target_role, experience_years, skills, target_company, timeline_months)

    def _build_fallback(self, current_role, target_role, exp, skills, company, months) -> dict:
        """Generate a complete roadmap without AI based on role analysis."""
        
        # Determine tech stack based on target role
        role_lower = target_role.lower()
        is_frontend = any(w in role_lower for w in ["frontend", "react", "ui", "web"])
        is_backend = any(w in role_lower for w in ["backend", "python", "java", "node"])
        is_fullstack = any(w in role_lower for w in ["fullstack", "full stack", "full-stack"])
        is_data = any(w in role_lower for w in ["data", "ml", "machine learning", "ai"])
        is_devops = any(w in role_lower for w in ["devops", "cloud", "sre", "infrastructure"])
        is_senior = any(w in role_lower for w in ["senior", "lead", "principal", "staff", "architect"])

        # Pick skills to learn based on role
        if is_data:
            skills_to_learn = ["Python", "Machine Learning", "SQL", "Statistics", "TensorFlow", "Power BI"]
            tech_courses = [
                {"title": "Machine Learning Specialization", "platform": "Coursera (Andrew Ng)", "url": "https://coursera.org/specializations/machine-learning-introduction", "duration": "3 months", "level": "intermediate", "cost": "Paid", "priority": "High", "reason": "Foundation of ML"},
                {"title": "Python for Data Science", "platform": "freeCodeCamp", "url": "https://freecodecamp.org", "duration": "6 weeks", "level": "beginner", "cost": "Free", "priority": "High", "reason": "Core language for data"},
                {"title": "SQL for Data Analysis", "platform": "Mode Analytics", "url": "https://mode.com/sql-tutorial", "duration": "2 weeks", "level": "beginner", "cost": "Free", "priority": "High", "reason": "Essential for data jobs"},
            ]
            projects = [
                {"title": "Customer Churn Prediction", "description": "Build an ML model to predict customer churn using Python and scikit-learn", "technologies": ["Python", "scikit-learn", "Pandas", "Matplotlib"], "difficulty": "Intermediate", "estimated_time": "3 weeks", "impact": "High — shows ML pipeline end-to-end"},
                {"title": "Sales Dashboard", "description": "Build an interactive sales analytics dashboard", "technologies": ["Python", "Streamlit", "SQL", "Plotly"], "difficulty": "Beginner", "estimated_time": "2 weeks", "impact": "High — visible portfolio project"},
            ]
        elif is_devops:
            skills_to_learn = ["Docker", "Kubernetes", "AWS", "CI/CD", "Terraform", "Linux"]
            tech_courses = [
                {"title": "Docker & Kubernetes: The Practical Guide", "platform": "Udemy", "url": "https://udemy.com/course/docker-kubernetes-the-practical-guide", "duration": "6 weeks", "level": "intermediate", "cost": "Paid", "priority": "High", "reason": "Core DevOps tools"},
                {"title": "AWS Cloud Practitioner", "platform": "AWS", "url": "https://aws.amazon.com/training", "duration": "4 weeks", "level": "beginner", "cost": "Free", "priority": "High", "reason": "Cloud foundation"},
            ]
            projects = [
                {"title": "CI/CD Pipeline with GitHub Actions", "description": "Set up a complete CI/CD pipeline for a web app", "technologies": ["Docker", "GitHub Actions", "AWS EC2", "Nginx"], "difficulty": "Intermediate", "estimated_time": "2 weeks", "impact": "High"},
                {"title": "Kubernetes Cluster Setup", "description": "Deploy a microservices app on Kubernetes", "technologies": ["Kubernetes", "Docker", "Helm", "AWS EKS"], "difficulty": "Advanced", "estimated_time": "4 weeks", "impact": "Very High"},
            ]
        elif is_frontend:
            skills_to_learn = ["React", "TypeScript", "Next.js", "Tailwind CSS", "Testing", "Performance"]
            tech_courses = [
                {"title": "React - The Complete Guide", "platform": "Udemy (Maximilian)", "url": "https://udemy.com/course/react-the-complete-guide-incl-redux", "duration": "8 weeks", "level": "intermediate", "cost": "Paid", "priority": "High", "reason": "Most in-demand frontend framework"},
                {"title": "TypeScript for Beginners", "platform": "freeCodeCamp", "url": "https://freecodecamp.org", "duration": "3 weeks", "level": "beginner", "cost": "Free", "priority": "High", "reason": "Industry standard"},
            ]
            projects = [
                {"title": "Full-Stack E-commerce App", "description": "Build a complete shopping app with cart, auth, and payments", "technologies": ["React", "TypeScript", "Node.js", "MongoDB"], "difficulty": "Intermediate", "estimated_time": "4 weeks", "impact": "Very High"},
                {"title": "Real-time Chat App", "description": "Build a WhatsApp-like chat with WebSockets", "technologies": ["React", "Socket.io", "Node.js", "Redux"], "difficulty": "Intermediate", "estimated_time": "3 weeks", "impact": "High"},
            ]
        else:
            # General software engineer / backend / fullstack
            skills_to_learn = ["System Design", "Docker", "Kubernetes", "Cloud (AWS/GCP)", "CI/CD", "Redis"]
            tech_courses = [
                {"title": "System Design Interview", "platform": "Educative", "url": "https://educative.io/courses/grokking-the-system-design-interview", "duration": "6 weeks", "level": "intermediate", "cost": "Paid", "priority": "High", "reason": "Critical for senior roles"},
                {"title": "Docker & Kubernetes", "platform": "Udemy", "url": "https://udemy.com/course/docker-kubernetes-the-practical-guide", "duration": "4 weeks", "level": "beginner", "cost": "Paid", "priority": "High", "reason": "Industry standard DevOps"},
                {"title": "LeetCode Patterns", "platform": "NeetCode", "url": "https://neetcode.io", "duration": "Ongoing", "level": "intermediate", "cost": "Free", "priority": "High", "reason": "Essential for coding interviews"},
            ]
            projects = [
                {"title": "URL Shortener Service", "description": "Build a scalable URL shortener like bit.ly with analytics", "technologies": ["Python/Node.js", "Redis", "PostgreSQL", "Docker"], "difficulty": "Intermediate", "estimated_time": "2 weeks", "impact": "High — demonstrates backend fundamentals"},
                {"title": "Real-time Notification System", "description": "Build a push notification system with WebSockets", "technologies": ["FastAPI", "WebSockets", "Redis", "React"], "difficulty": "Intermediate", "estimated_time": "3 weeks", "impact": "High"},
                {"title": "E-commerce REST API", "description": "Complete REST API with auth, payments, and admin dashboard", "technologies": ["FastAPI", "PostgreSQL", "Docker", "JWT"], "difficulty": "Intermediate", "estimated_time": "4 weeks", "impact": "Very High"},
            ]

        # Certifications by role
        if is_data:
            certs = [{"name": "Google Data Analytics Certificate", "provider": "Google/Coursera", "duration": "6 months", "cost": "Paid", "priority": "High", "url": "https://coursera.org/google-certificates"}]
        elif is_devops:
            certs = [{"name": "AWS Solutions Architect Associate", "provider": "Amazon", "duration": "3 months", "cost": "$300", "priority": "High", "url": "https://aws.amazon.com/certification"}]
        else:
            certs = [{"name": "AWS Cloud Practitioner", "provider": "Amazon", "duration": "1 month", "cost": "$100", "priority": "Medium", "url": "https://aws.amazon.com/certification"}]

        company_note = f" at {company}" if company else ""

        return {
            "current_role": current_role,
            "target_role": target_role,
            "target_company": company,
            "timeline_months": months,
            "readiness_score": min(40 + (exp * 10), 75),
            "gap_analysis": {
                "skill_gaps": skills_to_learn[:4],
                "experience_gaps": ["Leadership experience" if is_senior else "Project ownership", "Large-scale system experience"],
                "knowledge_gaps": ["System design fundamentals", "Cloud architecture basics"]
            },
            "monthly_plan": [
                {"month": 1, "focus": "Assessment & Foundation", "goals": ["Audit current skills", "Set up study environment", "Start DSA practice"], "tasks": ["Complete skills inventory", "Create study schedule", "Solve 20 LeetCode easy problems"], "milestone": "Clear learning plan with daily schedule"},
                {"month": 2, "focus": "Core Technical Skills", "goals": ["Master primary tech stack", "Build first project"], "tasks": ["Complete primary course", "Build project 1", "Solve 30 LeetCode medium problems"], "milestone": "Complete first portfolio project"},
                {"month": 3, "focus": "System Design & Architecture", "goals": ["Learn system design", "Deepen cloud knowledge"], "tasks": ["Study system design patterns", "Start AWS/cloud certification"], "milestone": "Able to design a scalable system"},
                {"month": 4, "focus": "Portfolio Building", "goals": ["Complete 2 strong projects", "Update GitHub/LinkedIn"], "tasks": ["Build project 2", "Write README and documentation", "Deploy projects live"], "milestone": "Two deployable portfolio projects ready"},
                {"month": 5, "focus": "Interview Preparation", "goals": ["Mock interviews", "Behavioral prep"], "tasks": ["10 mock interviews on InterviewAce", "Prepare 6 STAR stories", "Research target companies"], "milestone": "Interview-ready for target role"},
                {"month": 6, "focus": "Apply & Land Offer", "goals": [f"Apply to {company or 'target companies'}", "Network actively"], "tasks": ["Send 15-20 targeted applications", "Get 3-5 referrals", "Attend 2 tech meetups/events"], "milestone": f"Land offer{company_note}"},
            ][:min(6, months)],
            "milestones": [
                {"title": "🎯 Technical Foundation", "timeline": f"Month 1-{min(2, months//3)}", "description": "Build core technical skills and daily habits", "deliverables": ["Study schedule set", "50 LeetCode problems", "Primary course completed"], "resources": ["LeetCode", "NeetCode", "YouTube tutorials"]},
                {"title": "🚀 Portfolio Projects", "timeline": f"Month {min(2, months//3)+1}-{min(4, months//2)}", "description": "Build 2-3 impressive projects to showcase skills", "deliverables": ["2 deployed projects", "Active GitHub", "Technical blog (optional)"], "resources": ["GitHub", "Vercel/Netlify", "Railway/Render"]},
                {"title": "🎤 Interview Mastery", "timeline": f"Month {min(4, months//2)+1}-{min(5, months-1)}", "description": "Practice and perfect your interview skills", "deliverables": ["10 mock interviews completed", "6 STAR stories prepared", "Resume updated"], "resources": ["InterviewAce AI", "Pramp", "Glassdoor"]},
                {"title": "🏆 Land the Offer", "timeline": f"Month {min(5, months-1)+1}-{months}", "description": f"Active job search and negotiations{company_note}", "deliverables": ["15+ applications sent", "2-3 offers negotiated", "Dream job secured"], "resources": ["LinkedIn", "Glassdoor", "Company careers pages"]},
            ],
            "recommended_courses": tech_courses + [
                {"title": "The Complete SQL Bootcamp", "platform": "Udemy", "url": "https://udemy.com/course/the-complete-sql-bootcamp", "duration": "3 weeks", "level": "beginner", "cost": "Paid", "priority": "Medium", "reason": "SQL is needed in every engineering role"},
                {"title": "Git & GitHub Crash Course", "platform": "freeCodeCamp (YouTube)", "url": "https://youtube.com/watch?v=RGOj5yH7evk", "duration": "1 week", "level": "beginner", "cost": "Free", "priority": "High", "reason": "Essential collaboration tool"},
            ],
            "recommended_projects": projects,
            "certifications": certs,
            "books": [
                {"title": "Clean Code", "author": "Robert C. Martin", "focus": "Code quality and best practices", "priority": "Must Read"},
                {"title": "Designing Data-Intensive Applications", "author": "Martin Kleppmann", "focus": "System design and distributed systems", "priority": "Must Read"},
                {"title": "Cracking the Coding Interview", "author": "Gayle Laakmann McDowell", "focus": "Technical interview preparation", "priority": "Must Read"},
                {"title": "The Pragmatic Programmer", "author": "Hunt & Thomas", "focus": "Software craftsmanship", "priority": "Highly Recommended"},
            ],
            "weekly_schedule": {
                "monday": "DSA practice on LeetCode (2h)",
                "tuesday": "Course / system design study (2h)",
                "wednesday": "Project work (2h)",
                "thursday": "Mock interview on InterviewAce (1h)",
                "friday": "Review + YouTube tutorials (1.5h)",
                "weekend": "Project work + LinkedIn networking (3h)"
            },
            "networking_tips": [
                f"Connect with 3 engineers{company_note} on LinkedIn weekly",
                "Comment thoughtfully on tech posts to get visibility",
                "Attend local tech meetups or virtual events",
                "Contribute to 1 open-source project (even docs/tests)",
                "Write 1 LinkedIn post per week about what you're learning",
            ],
            "application_strategy": f"Start applying when 70% ready — don't wait for perfect. Target {company or '10-15 companies'} with a mix of reach, target, and safety companies. Referrals convert 5-10x better than cold applications — prioritize networking.",
            "salary_expectation": "Research current market rates on Glassdoor, LinkedIn Salary, and AmbitionBox (India) or Levels.fyi (global). Always negotiate — first offers are rarely final.",
            "skills_to_learn": skills_to_learn,
            "skills_to_strengthen": skills if skills else ["Data Structures", "Problem Solving", "Communication", "System Design"],
        }
