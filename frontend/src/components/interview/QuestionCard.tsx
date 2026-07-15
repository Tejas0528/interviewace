import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Lightbulb, Star } from 'lucide-react'
import { cn } from '@/utils/helpers'

interface QuestionCardProps {
  question: string
  category: string
  difficulty?: 'easy' | 'medium' | 'hard'
  tips?: string[]
  sampleAnswer?: string
  index: number
}

const difficultyColors = {
  easy: 'badge-success',
  medium: 'badge-warning',
  hard: 'badge-danger',
}

export default function QuestionCard({
  question,
  category,
  difficulty = 'medium',
  tips = [],
  sampleAnswer,
  index,
}: QuestionCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="glass-card"
    >
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-start gap-3 text-left"
      >
        <div className="w-7 h-7 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-xs font-bold text-brand-400">{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-200 leading-relaxed">{question}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="badge bg-white/5 text-slate-500 border border-white/10">{category}</span>
            <span className={difficultyColors[difficulty]}>{difficulty}</span>
          </div>
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-slate-500 flex-shrink-0 mt-1 transition-transform',
            expanded && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-4 border-t border-white/5 pt-4">
              {tips.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tips</span>
                  </div>
                  <ul className="space-y-1.5">
                    {tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-500">
                        <span className="text-amber-400 mt-0.5">›</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {sampleAnswer && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-brand-400" />
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sample Answer</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed bg-brand-500/5 border border-brand-500/10 rounded-xl p-3">
                    {sampleAnswer}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
