import apiClient from './client'
import type { Analytics, CareerRoadmap, Report } from '@/types'

export const analyticsApi = {
  getDashboard: async (): Promise<Analytics> => {
    const { data } = await apiClient.get('/analytics/dashboard')
    return data
  },

  getCareerRoadmap: async (): Promise<CareerRoadmap> => {
    const { data } = await apiClient.get('/career/roadmap')
    return data
  },

  generateRoadmap: async (payload: {
    current_role: string
    target_role: string
    experience_years: number
    skills: string[]
    target_company?: string
  }): Promise<CareerRoadmap> => {
    const { data } = await apiClient.post('/career/roadmap/generate', payload)
    return data
  },

  getReports: async (): Promise<Report[]> => {
    const { data } = await apiClient.get('/reports/')
    return data
  },

  generateReport: async (
    type: 'interview' | 'resume' | 'career',
    sourceId: string
  ): Promise<Report> => {
    const { data } = await apiClient.post('/reports/generate', { type, source_id: sourceId })
    return data
  },

  getResumeHistory: async (): Promise<{ history: Array<{
    id: string
    filename: string
    date: string
    resume_score: number | null
    ats_score: number | null
  }> }> => {
    const { data } = await apiClient.get('/analytics/resume-history')
    return data
  },

  downloadReport: async (reportId: string): Promise<Blob> => {
    const { data } = await apiClient.get(`/reports/${reportId}/download`, {
      responseType: 'blob',
    })
    return data
  },
}
