import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { ReactNode } from 'react'

interface ScoreCardProps {
  title: string
  value: number | string
  change?: number
  icon: ReactNode
  iconBg?: string
  suffix?: string
  description?: string
}

export default function ScoreCard({
  title,
  value,
  change,
  icon,
  iconBg = 'from-brand-500 to-purple-600',
  suffix = '',
  description,
}: ScoreCardProps) {
  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="glass-card"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${iconBg} flex items-center justify-center text-white flex-shrink-0`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg
            ${isPositive ? 'bg-emerald-500/15 text-emerald-400' :
              isNegative ? 'bg-red-500/15 text-red-400' :
              'bg-white/5 text-slate-400'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> :
             isNegative ? <TrendingDown className="w-3 h-3" /> :
             <Minus className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>

      <div className="text-3xl font-bold text-white mb-1">
        {value}{suffix}
      </div>
      <div className="text-sm text-slate-400">{title}</div>
      {description && (
        <div className="text-xs text-slate-600 mt-1">{description}</div>
      )}
    </motion.div>
  )
}
