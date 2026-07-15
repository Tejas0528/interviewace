import { motion } from 'framer-motion'
import { CheckCircle2, XCircle } from 'lucide-react'
import ProgressRing from '@/components/dashboard/ProgressRing'
import type { ATSScore } from '@/types'

export default function ATSReport({ ats }: { ats: ATSScore }) {
  const metrics = [
    { label: 'Keyword Match', value: ats.keyword_match },
    { label: 'Formatting', value: ats.formatting_score },
    { label: 'Action Verbs', value: ats.action_verbs_score },
    { label: 'Readability', value: ats.readability_score },
  ]

  return (
    <div className="glass-card space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="section-title mb-1">ATS Score</h3>
          <p className="text-sm text-slate-500">Applicant Tracking System compatibility</p>
        </div>
        <ProgressRing value={ats.score} size={90} color="auto" sublabel="%ATS" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map(({ label, value }) => (
          <div key={label} className="bg-white/3 rounded-xl p-3 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">{label}</span>
              <span className="text-sm font-semibold text-slate-200">{value}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${value >= 70 ? 'bg-emerald-500' : value >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.7 }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs font-medium text-emerald-400 mb-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Found Keywords
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {ats.found_keywords.slice(0, 8).map((kw) => (
              <span key={kw} className="badge-success">{kw}</span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-medium text-red-400 mb-2 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Missing Keywords
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {ats.missing_keywords.slice(0, 8).map((kw) => (
              <span key={kw} className="badge-danger">{kw}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
