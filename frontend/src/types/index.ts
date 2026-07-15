// Auth
export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  created_at: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface SignupPayload {
  email: string
  password: string
  full_name: string
}

// Resume
export interface Resume {
  id: string
  user_id: string
  filename: string
  content: string
  parsed_data: ParsedResume
  created_at: string
}

export interface ParsedResume {
  name?: string
  email?: string
  phone?: string
  summary?: string
  education: Education[]
  experience: Experience[]
  skills: string[]
  projects: Project[]
  certifications: string[]
  achievements: string[]
}

export interface Education {
  institution: string
  degree: string
  field: string
  start_date: string
  end_date: string
  gpa?: string
}

export interface Experience {
  company: string
  role: string
  start_date: string
  end_date: string
  description: string[]
}

export interface Project {
  name: string
  description: string
  technologies: string[]
  url?: string
}

// Scores
export interface ResumeScore {
  overall: number
  sections: {
    summary: number
    experience: number
    education: number
    skills: number
    projects: number
    formatting: number
    grammar: number
  }
  suggestions: string[]
}

export interface ATSScore {
  score: number
  keyword_match: number
  formatting_score: number
  action_verbs_score: number
  readability_score: number
  missing_keywords: string[]
  found_keywords: string[]
  suggestions: string[]
}

// Interview
export interface InterviewSession {
  id: string
  user_id: string
  job_role: string
  company?: string
  interview_type: 'hr' | 'technical' | 'behavioral' | 'mixed'
  status: 'pending' | 'active' | 'completed'
  questions: InterviewQuestion[]
  started_at: string
  completed_at?: string
  scores?: InterviewScores
}

export interface InterviewQuestion {
  id: string
  question: string
  category: string
  expected_points?: string[]
  answer?: string
  feedback?: string
  score?: number
}

export interface InterviewScores {
  overall: number
  confidence: number
  communication: number
  technical_accuracy: number
  behavioral: number
  star_method: number
  professionalism: number
  problem_solving?: number
  performance_summary?: string
  strong_areas?: string[]
  weak_areas?: string[]
  top_improvements?: string[]
  interview_readiness?: string
  next_steps?: string[]
}

// Career
export interface CareerRoadmap {
  current_role: string
  target_role: string
  target_company?: string
  timeline_months: number
  milestones: Milestone[]
  recommended_courses: Course[]
  recommended_projects: ProjectRecommendation[]
  skills_to_learn: string[]
}

export interface Milestone {
  title: string
  description: string
  timeline: string
  resources: string[]
}

export interface Course {
  title: string
  platform: string
  url: string
  duration: string
  level: 'beginner' | 'intermediate' | 'advanced'
}

export interface ProjectRecommendation {
  title: string
  description: string
  technologies: string[]
  difficulty: string
  estimated_time: string
}

// Analytics
export interface Analytics {
  total_sessions: number
  average_score: number
  improvement_rate: number
  weak_areas: string[]
  strong_areas: string[]
  recent_sessions: SessionSummary[]
  score_trend: ScorePoint[]
  skill_breakdown?: {
    technical_accuracy?: number
    communication?: number
    confidence?: number
    behavioral?: number
    star_method?: number
    professionalism?: number
    problem_solving?: number
  }
}

export interface SessionSummary {
  id: string
  date: string
  score: number
  type: string
  duration_minutes: number
}

export interface ScorePoint {
  date: string
  score: number
}

// Agent
export interface AgentStatus {
  name: string
  status: 'idle' | 'running' | 'completed' | 'error'
  progress?: number
  message?: string
}

// Report
export interface Report {
  id: string
  type: 'interview' | 'resume' | 'career'
  title: string
  created_at: string
  download_url: string
  summary: string
}
