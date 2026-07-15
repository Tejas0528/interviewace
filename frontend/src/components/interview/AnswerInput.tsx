import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff, Lightbulb } from 'lucide-react'
import { cn } from '@/utils/helpers'

interface AnswerInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  showSTARHelper?: boolean
}

const STAR_PARTS = [
  { label: 'S — Situation', desc: 'Set the context briefly', color: 'text-blue-400' },
  { label: 'T — Task', desc: 'Your specific responsibility', color: 'text-purple-400' },
  { label: 'A — Action', desc: 'What YOU did (use "I")', color: 'text-amber-400' },
  { label: 'R — Result', desc: 'Measurable outcome achieved', color: 'text-emerald-400' },
]

export default function AnswerInput({
  value,
  onChange,
  placeholder = 'Type your answer here...',
  disabled = false,
  showSTARHelper = false,
}: AnswerInputProps) {
  const [showHelper, setShowHelper] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0
  const isLong = wordCount >= 100
  const isGood = wordCount >= 50 && wordCount <= 300

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showSTARHelper && (
            <button
              type="button"
              onClick={() => setShowHelper((p) => !p)}
              className={cn(
                'flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all',
                showHelper
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                  : 'bg-white/5 text-slate-500 border-white/10 hover:text-slate-300'
              )}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              STAR Guide
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={cn('text-xs', isGood ? 'text-emerald-400' : isLong ? 'text-amber-400' : 'text-slate-600')}>
            {wordCount} words
          </span>
          <button
            type="button"
            onClick={() => setIsRecording((p) => !p)}
            className={cn(
              'w-7 h-7 rounded-lg flex items-center justify-center border transition-all',
              isRecording
                ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse'
                : 'bg-white/5 text-slate-500 border-white/10 hover:text-slate-300'
            )}
          >
            {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* STAR Helper */}
      {showHelper && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-white/3 border border-white/5"
        >
          {STAR_PARTS.map(({ label, desc, color }) => (
            <div key={label} className="flex items-start gap-2">
              <span className={cn('text-xs font-bold flex-shrink-0', color)}>{label.split(' ')[0]}</span>
              <div>
                <p className={cn('text-xs font-medium', color)}>{label.split('—')[1]?.trim()}</p>
                <p className="text-xs text-slate-600">{desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={6}
        className={cn(
          'w-full bg-dark-700 border rounded-xl px-4 py-3',
          'text-sm text-slate-200 placeholder:text-slate-600 leading-relaxed',
          'focus:outline-none transition-all duration-200 resize-none',
          disabled
            ? 'border-white/5 opacity-60 cursor-not-allowed'
            : 'border-white/10 focus:border-brand-500/40 focus:ring-2 focus:ring-brand-500/10'
        )}
      />

      {/* Word count bar */}
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className={cn(
            'h-full rounded-full transition-all',
            isGood ? 'bg-emerald-500' : isLong ? 'bg-amber-500' : 'bg-brand-500'
          )}
          animate={{ width: `${Math.min((wordCount / 300) * 100, 100)}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <p className="text-xs text-slate-600">
        {wordCount < 50 ? 'Add more detail' : isGood ? 'Good length!' : 'Getting long — be concise'}
      </p>
    </div>
  )
}
