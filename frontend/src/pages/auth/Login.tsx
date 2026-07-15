import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type FormData = z.infer<typeof schema>

export default function Login() {
  const { login, isLoginLoading } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-hero-gradient px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-slate-400">Sign in to your InterviewAce account</p>
        </div>

        {/* Form */}
        <div className="glass p-8 space-y-5">
          <form onSubmit={handleSubmit(login)} className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className="input-field pl-10"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="input-field pl-10"
                />
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-brand-400 hover:text-brand-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={isLoginLoading} className="btn-primary w-full flex items-center justify-center gap-2">
              {isLoginLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign in <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-400 hover:text-brand-300 transition-colors">
              Sign up free
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
