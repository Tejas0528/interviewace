import { create } from 'zustand'
import type { InterviewSession, InterviewQuestion, AgentStatus } from '@/types'

interface InterviewState {
  currentSession: InterviewSession | null
  currentQuestion: InterviewQuestion | null
  questionIndex: number
  answers: Record<string, string>
  agentStatuses: AgentStatus[]
  isLoading: boolean
  setSession: (session: InterviewSession) => void
  setQuestion: (question: InterviewQuestion, index: number) => void
  saveAnswer: (questionId: string, answer: string) => void
  updateAgentStatus: (status: AgentStatus) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

export const useInterviewStore = create<InterviewState>((set) => ({
  currentSession: null,
  currentQuestion: null,
  questionIndex: 0,
  answers: {},
  agentStatuses: [],
  isLoading: false,

  setSession: (session) => set({ currentSession: session }),
  setQuestion: (question, index) => set({ currentQuestion: question, questionIndex: index }),
  saveAnswer: (questionId, answer) =>
    set((s) => ({ answers: { ...s.answers, [questionId]: answer } })),
  updateAgentStatus: (status) =>
    set((s) => ({
      agentStatuses: s.agentStatuses.map((a) => (a.name === status.name ? status : a)),
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  reset: () =>
    set({
      currentSession: null,
      currentQuestion: null,
      questionIndex: 0,
      answers: {},
      agentStatuses: [],
    }),
}))
