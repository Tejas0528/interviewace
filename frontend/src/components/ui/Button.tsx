import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/helpers'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const variants = {
  primary: 'bg-brand-gradient text-white hover:shadow-lg hover:shadow-brand-500/30 hover:scale-[1.02] active:scale-[0.98]',
  secondary: 'bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 hover:border-white/20',
  ghost: 'text-slate-400 hover:text-slate-200 hover:bg-white/5',
  danger: 'bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3.5 text-base rounded-xl',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  )
}
