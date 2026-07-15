import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Zap, Mail, ArrowLeft, Send } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const schema = z.object({ email: z.string().email('Enter a valid email') })
type FormData = z.infer<typeof schema>

export default function ForgotPassword() {
  const { forgotPassword } = useAuth()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-hero-gradient px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/8 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-lg shadow-brand-500/30 mx-auto mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Forgot password?</h1>
          <p className="text-slate-400">We'll send a reset link to your email</p>
        </div>

        <div className="glass p-8 space-y-5">
          <form onSubmit={handleSubmit((d) => forgotPassword(d.email))} className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className="input-field pl-10"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex items-center justify-center gap-2">
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Send className="w-4 h-4" /> Send reset link</>
              )}
            </button>
          </form>

          <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
