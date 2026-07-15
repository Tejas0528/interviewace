import apiClient from './client'
import type { Resume, ResumeScore, ATSScore } from '@/types'

export const resumeApi = {
  upload: async (file: File): Promise<Resume> => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await apiClient.post('/resume/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  getAll: async (): Promise<Resume[]> => {
    const { data } = await apiClient.get('/resume/')
    return data
  },

  getById: async (id: string): Promise<Resume> => {
    const { data } = await apiClient.get(`/resume/${id}`)
    return data
  },

  analyze: async (resumeId: string): Promise<ResumeScore> => {
    const { data } = await apiClient.post(`/resume/${resumeId}/analyze`)
    return data
  },

  getATSScore: async (resumeId: string, jobDescription?: string): Promise<ATSScore> => {
    const { data } = await apiClient.post(`/resume/${resumeId}/ats`, {
      job_description: jobDescription,
    })
    return data
  },

  improve: async (resumeId: string): Promise<{ improved_content: string; changes: string[] }> => {
    const { data } = await apiClient.post(`/resume/${resumeId}/improve`)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/resume/${id}`)
  },
}
