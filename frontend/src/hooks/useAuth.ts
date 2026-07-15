import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import type { LoginPayload, SignupPayload } from '@/types'

export const useAuth = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setTokens, setUser, logout: storeLogout, isAuthenticated } = useAuthStore()

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const u = await authApi.getMe()
      setUser(u)
      return u
    },
    enabled: isAuthenticated,
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (tokens) => {
      setTokens(tokens.access_token, tokens.refresh_token)
      const user = await authApi.getMe()
      setUser(user)
      navigate('/dashboard')
      toast.success(`Welcome back, ${user.full_name}!`)
    },
    onError: () => toast.error('Invalid email or password'),
  })

  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: () => {
      navigate('/login')
      toast.success('Account created! Please login.')
    },
    onError: () => toast.error('Signup failed. Email may already be in use.'),
  })

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      storeLogout()
      queryClient.clear()
      navigate('/login')
    },
  })

  const forgotPasswordMutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => toast.success('Password reset link sent to your email'),
    onError: () => toast.error('Failed to send reset link'),
  })

  return {
    user,
    isAuthenticated,
    isLoadingUser,
    login: (payload: LoginPayload) => loginMutation.mutate(payload),
    signup: (payload: SignupPayload) => signupMutation.mutate(payload),
    logout: () => logoutMutation.mutate(),
    forgotPassword: (email: string) => forgotPasswordMutation.mutate(email),
    isLoginLoading: loginMutation.isPending,
    isSignupLoading: signupMutation.isPending,
  }
}
