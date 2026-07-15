import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import ProgressRing from '@/components/dashboard/ProgressRing'
import type { ResumeScore } from '@/types'

export default function ResumeScorePanel({ score }: { score: ResumeScore }) {
  const sections = [
    { label: 'Summary', key: 'summary' },
    { label: 'Experience', key: 'experience' },
    { label: 'Education', key: 'education' },
    { label: 'Skills', key: 'skills' },
    { label: 'Projects', key: 'projects' },
    { label: 'Formatting', key: 'formatting' },
    { label: 'Grammar', key: 'grammar' },
  ] as const

  const getColor = (v: number) =>
    v >= 80 ? 'bg-emerald-500' : v >= 60 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="glass-card space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="section-title mb-0">Resume Score</h3>
        <ProgressRing value={score.overall} size={80} color="auto" sublabel="/100" />
      </div>

      <div className="space-y-3">
        {sections.map(({ label, key }) => {
          const val = score.sections[key]
          return (
            <div key={key} className="flex items-center gap-3">
              <span className="text-sm text-slate-400 w-24 flex-shrink-0">{label}</span>
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${getColor(val)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${val}%` }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                />
              </div>
              <span className="text-sm text-slate-300 w-8 text-right">{val}</span>
            </div>
          )
        })}
      </div>

      {score.suggestions.length > 0 && (
        <div className="border-t border-white/5 pt-4">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Suggestions</h4>
          <ul className="space-y-2">
            {score.suggestions.map((s, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-2 text-sm text-slate-400"
              >
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                {s}
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
