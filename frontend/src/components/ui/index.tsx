import { ReactNode } from 'react'
import { cn } from '@/utils/helpers'

// Badge
type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-white/5 text-slate-400 border-white/10',
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  danger: 'bg-red-500/15 text-red-400 border-red-500/20',
  info: 'bg-brand-500/15 text-brand-400 border-brand-500/20',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
}

export function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

// Card
export function Card({
  children,
  className,
  hover = false,
  onClick,
}: {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'glass-card',
        hover && 'cursor-pointer hover:border-white/15 hover:shadow-lg hover:shadow-brand-500/5',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}

// Divider
export function Divider({ className }: { className?: string }) {
  return <div className={cn('border-t border-white/5', className)} />
}

// Empty state
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="glass-card text-center py-16 px-8">
      {icon && <div className="flex justify-center mb-4 text-slate-600">{icon}</div>}
      <h3 className="text-lg font-semibold text-slate-400 mb-2">{title}</h3>
      {description && <p className="text-sm text-slate-600 mb-6 max-w-sm mx-auto">{description}</p>}
      {action}
    </div>
  )
}
