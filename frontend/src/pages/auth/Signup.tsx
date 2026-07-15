import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Zap, Mail, Lock, User, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const schema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})
type FormData = z.infer<typeof schema>

export default function Signup() {
  const { signup, isSignupLoading } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = ({ full_name, email, password }: FormData) =>
    signup({ full_name, email, password })

  return (
    <div className="min-h-screen flex items-center justify-center bg-hero-gradient px-4 py-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Start for free</h1>
          <p className="text-slate-400">Create your InterviewAce account</p>
        </div>

        <div className="glass p-8 space-y-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {[
              { name: 'full_name', label: 'Full Name', type: 'text', icon: User, placeholder: 'John Doe' },
              { name: 'email', label: 'Email', type: 'email', icon: Mail, placeholder: 'you@example.com' },
              { name: 'password', label: 'Password', type: 'password', icon: Lock, placeholder: '••••••••' },
              { name: 'confirm_password', label: 'Confirm Password', type: 'password', icon: Lock, placeholder: '••••••••' },
            ].map(({ name, label, type, icon: Icon, placeholder }) => (
              <div key={name}>
                <label className="text-sm text-slate-400 mb-1.5 block">{label}</label>
                <div className="relative">
                  <Icon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    {...register(name as keyof FormData)}
                    type={type}
                    placeholder={placeholder}
                    className="input-field pl-10"
                  />
                </div>
                {errors[name as keyof FormData] && (
                  <p className="text-red-400 text-xs mt-1">{errors[name as keyof FormData]?.message}</p>
                )}
              </div>
            ))}

            <button type="submit" disabled={isSignupLoading} className="btn-primary w-full flex items-center justify-center gap-2">
              {isSignupLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
