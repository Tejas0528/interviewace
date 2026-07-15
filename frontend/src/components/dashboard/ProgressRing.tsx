import { motion } from 'framer-motion'

interface ProgressRingProps {
  value: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
  sublabel?: string
}

export default function ProgressRing({
  value,
  size = 120,
  strokeWidth = 8,
  color = '#6366f1',
  label,
  sublabel,
}: ProgressRingProps) {
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (value / 100) * circumference

  const getColor = () => {
    if (value >= 80) return '#10b981'
    if (value >= 60) return '#f59e0b'
    if (value >= 40) return '#6366f1'
    return '#ef4444'
  }

  const finalColor = color === 'auto' ? getColor() : color

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={finalColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 8px ${finalColor}60)` }}
          />
        </svg>

        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-2xl font-bold text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {value}
          </motion.span>
          {sublabel && <span className="text-xs text-slate-500">{sublabel}</span>}
        </div>
      </div>

      {label && <span className="text-sm text-slate-400 text-center">{label}</span>}
    </div>
  )
}
