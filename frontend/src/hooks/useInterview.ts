import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { interviewApi } from '@/api/interview'
import { useInterviewStore } from '@/stores/interviewStore'

export const useInterview = (sessionId?: string) => {
  const queryClient = useQueryClient()
  const { setSession, setQuestion, reset } = useInterviewStore()

  const sessions = useQuery({
    queryKey: ['interview-sessions'],
    queryFn: interviewApi.getSessions,
  })

  const session = useQuery({
    queryKey: ['interview-session', sessionId],
    queryFn: () => interviewApi.getSession(sessionId!),
    enabled: !!sessionId,
  })

  const createSessionMutation = useMutation({
    mutationFn: interviewApi.createSession,
    onSuccess: async (newSession) => {
      setSession(newSession)
      queryClient.invalidateQueries({ queryKey: ['interview-sessions'] })
      // Immediately fetch first question
      const q = await interviewApi.getNextQuestion(newSession.id)
      setQuestion(q, 0)
      return newSession
    },
    onError: () => toast.error('Failed to start interview session'),
  })

  const submitAnswerMutation = useMutation({
    mutationFn: ({
      sessionId,
      questionId,
      answer,
    }: {
      sessionId: string
      questionId: string
      answer: string
    }) => interviewApi.submitAnswer(sessionId, questionId, answer),
    onError: () => toast.error('Failed to submit answer'),
  })

  const completeSessionMutation = useMutation({
    mutationFn: (id: string) => interviewApi.completeSession(id),
    onSuccess: (completed) => {
      setSession(completed)
      queryClient.invalidateQueries({ queryKey: ['interview-sessions'] })
      toast.success('Interview completed! View your results.')
    },
  })

  return {
    sessions: sessions.data ?? [],
    isLoadingSessions: sessions.isLoading,
    session: session.data,

    createSession: createSessionMutation.mutateAsync,
    isCreating: createSessionMutation.isPending,

    submitAnswer: submitAnswerMutation.mutateAsync,
    isSubmitting: submitAnswerMutation.isPending,

    completeSession: completeSessionMutation.mutateAsync,
    isCompleting: completeSessionMutation.isPending,

    reset,
  }
}
