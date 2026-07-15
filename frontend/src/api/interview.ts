import apiClient from './client'
import type { InterviewSession, InterviewQuestion } from '@/types'

export const interviewApi = {
  createSession: async (payload: {
    job_role: string
    company?: string
    interview_type: string
    resume_id?: string
  }): Promise<InterviewSession> => {
    const { data } = await apiClient.post('/interview/sessions', payload)
    return data
  },

  getSessions: async (): Promise<InterviewSession[]> => {
    const { data } = await apiClient.get('/interview/sessions')
    return data
  },

  getSession: async (id: string): Promise<InterviewSession> => {
    const { data } = await apiClient.get(`/interview/sessions/${id}`)
    return data
  },

  getNextQuestion: async (sessionId: string): Promise<InterviewQuestion> => {
    const { data } = await apiClient.get(`/interview/sessions/${sessionId}/next-question`)
    return data
  },

  submitAnswer: async (
    sessionId: string,
    questionId: string,
    answer: string
  ): Promise<{ feedback: string; score: number; next_question?: InterviewQuestion }> => {
    const { data } = await apiClient.post(`/interview/sessions/${sessionId}/answer`, {
      question_id: questionId,
      answer,
    })
    return data
  },

  completeSession: async (sessionId: string): Promise<InterviewSession> => {
    const { data } = await apiClient.post(`/interview/sessions/${sessionId}/complete`)
    return data
  },

  getLearningContent: async (topic: string): Promise<{ content: string; examples: string[] }> => {
    const { data } = await apiClient.get(`/interview/learn/${topic}`)
    return data
  },

  getCompanyGuide: async (company: string): Promise<{
    company: string
    rounds: string[]
    tips: string[]
    sample_questions: string[]
    culture: string
  }> => {
    const { data } = await apiClient.get(`/interview/company/${company}`)
    return data
  },
}
