import { InputHTMLAttributes, ReactNode, forwardRef } from 'react'
import { cn } from '@/utils/helpers'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-sm text-slate-400 font-medium block">{label}</label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3',
              'text-slate-100 placeholder:text-slate-500',
              'focus:outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20',
              'transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-red-500/50 focus:border-red-500/60 focus:ring-red-500/20',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        {hint && !error && <p className="text-slate-600 text-xs">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
