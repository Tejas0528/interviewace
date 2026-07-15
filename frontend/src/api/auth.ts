import apiClient from './client'
import type { LoginPayload, SignupPayload, AuthTokens, User } from '@/types'

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthTokens> => {
    const form = new URLSearchParams()
    form.append('username', payload.email)
    form.append('password', payload.password)
    const { data } = await apiClient.post('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    return data
  },

  signup: async (payload: SignupPayload): Promise<User> => {
    const { data } = await apiClient.post('/auth/signup', payload)
    return data
  },

  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get('/auth/me')
    return data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email })
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await apiClient.post('/auth/reset-password', { token, password })
  },
}
