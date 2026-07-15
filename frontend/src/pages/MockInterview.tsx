import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Brain, Play, ChevronRight, Trophy, Download, Loader2 } from 'lucide-react'
import { interviewApi } from '@/api/interview'
import { analyticsApi } from '@/api/analytics'
import { downloadBlob } from '@/utils/helpers'
import toast from 'react-hot-toast'
import MockInterviewScreen from '@/components/interview/MockInterview'
import ProgressRing from '@/components/dashboard/ProgressRing'
import type { InterviewSession, InterviewQuestion } from '@/types'

const INTERVIEW_TYPES = [
  { value: 'hr', label: 'HR Interview', desc: 'Background, motivation, fit', color: 'from-blue-500 to-cyan-500' },
  { value: 'technical', label: 'Technical', desc: 'Coding, system design', color: 'from-purple-500 to-pink-500' },
  { value: 'behavioral', label: 'Behavioral', desc: 'STAR method, soft skills', color: 'from-amber-500 to-orange-500' },
  { value: 'mixed', label: 'Mixed', desc: 'All types combined', color: 'from-emerald-500 to-teal-500' },
]

export default function MockInterviewPage() {
  const [step, setStep] = useState<'setup' | 'interview' | 'results'>('setup')
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null)
  const [qIndex, setQIndex] = useState(0)
  const [feedback, setFeedback] = useState<string | undefined>()
  const [qScore, setQScore] = useState<number | undefined>()
  const [form, setForm] = useState({ job_role: '', company: '', interview_type: 'mixed' })

  const createSession = useMutation({
    mutationFn: interviewApi.createSession,
    onSuccess: async (s) => {
      setSession(s)
      const q = await interviewApi.getNextQuestion(s.id)
      setCurrentQuestion(q)
      setStep('interview')
    },
  })

  const submitAnswer = useMutation({
    mutationFn: ({ answer }: { answer: string }) =>
      interviewApi.submitAnswer(session!.id, currentQuestion!.id, answer),
    onSuccess: (res) => {
      setFeedback(res.feedback)
      setQScore(res.score)
      if (res.next_question) {
        setTimeout(() => {
          setCurrentQuestion(res.next_question!)
          setQIndex((p) => p + 1)
          setFeedback(undefined)
          setQScore(undefined)
        }, 3000)
      } else {
        setTimeout(() => setStep('results'), 3000)
      }
    },
  })

  const completeSession = useMutation({
    mutationFn: () => interviewApi.completeSession(session!.id),
    onSuccess: (s) => {
      setSession(s)
      setStep('results')
    },
  })

  const downloadReportMutation = useMutation({
    mutationFn: async () => {
      const report = await analyticsApi.generateReport('interview', session!.id)
      return analyticsApi.downloadReport(report.id)
    },
    onSuccess: (blob) => {
      downloadBlob(blob, `interview_report_${session?.id}.pdf`)
      toast.success('Report downloaded!')
    },
    onError: () => toast.error('Failed to generate report'),
  })

  if (step === 'setup') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Start Mock Interview</h2>
          <p className="text-slate-400">Configure your practice session</p>
        </div>

        <div className="glass-card space-y-5">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Job Role *</label>
            <input
              value={form.job_role}
              onChange={(e) => setForm((p) => ({ ...p, job_role: e.target.value }))}
              placeholder="e.g. Software Engineer, Product Manager"
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Target Company (optional)</label>
            <input
              value={form.company}
              onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
              placeholder="e.g. Google, Amazon, Startup"
              className="input-field"
            />
          </div>
        </div>

        <div className="glass-card">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Interview Type</h3>
          <div className="grid grid-cols-2 gap-3">
            {INTERVIEW_TYPES.map(({ value, label, desc, color }) => (
              <button
                key={value}
                onClick={() => setForm((p) => ({ ...p, interview_type: value }))}
                className={`p-4 rounded-xl border text-left transition-all ${
                  form.interview_type === value
                    ? 'bg-brand-500/15 border-brand-500/40'
                    : 'bg-white/3 border-white/5 hover:border-white/15'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} mb-2 flex items-center justify-center`}>
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm font-medium text-slate-200">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => createSession.mutate(form)}
          disabled={!form.job_role || createSession.isPending}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {createSession.isPending ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Play className="w-4 h-4" />
              Start Interview
            </>
          )}
        </button>
      </div>
    )
  }

  if (step === 'interview' && currentQuestion) {
    return (
      <div className="max-w-3xl mx-auto h-full flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">{session?.job_role}</h2>
            <p className="text-sm text-slate-500">{session?.interview_type} interview</p>
          </div>
          <button
            onClick={() => completeSession.mutate()}
            className="btn-secondary text-sm"
          >
            End Interview
          </button>
        </div>

        <MockInterviewScreen
          question={currentQuestion}
          questionIndex={qIndex}
          totalQuestions={10}
          onSubmit={(answer) => submitAnswer.mutate({ answer })}
          isSubmitting={submitAnswer.isPending}
          feedback={feedback}
          score={qScore}
        />
      </div>
    )
  }

  if (step === 'results' && session?.scores) {
    const scores = session.scores
    const scoreItems = [
      { label: 'Confidence', value: scores.confidence },
      { label: 'Communication', value: scores.communication },
      { label: 'Technical', value: scores.technical_accuracy },
      { label: 'Behavioral', value: scores.behavioral },
      { label: 'STAR Method', value: scores.star_method },
      { label: 'Professionalism', value: scores.professionalism },
    ]

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">Interview Complete!</h2>
          <p className="text-slate-400">Here's your performance breakdown</p>
        </motion.div>

        <div className="glass-card text-center">
          <ProgressRing value={scores.overall} size={130} color="auto" label="Overall Score" />
          {scores.interview_readiness && (
            <p className="text-sm text-slate-400 mt-3">{scores.interview_readiness}</p>
          )}
        </div>

        {scores.performance_summary && (
          <div className="glass-card">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Performance Summary</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{scores.performance_summary}</p>
          </div>
        )}

        <div className="glass-card">
          <h3 className="section-title">Detailed Scores</h3>
          <div className="grid grid-cols-2 gap-4">
            {scoreItems.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5">
                <span className="text-sm text-slate-400">{label}</span>
                <span className={`text-sm font-bold ${value >= 70 ? 'text-emerald-400' : value >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {value}/100
                </span>
              </div>
            ))}
          </div>
        </div>

        {(scores.strong_areas?.length || scores.weak_areas?.length) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scores.strong_areas?.length && (
              <div className="glass-card">
                <h3 className="text-sm font-semibold text-emerald-400 mb-3">Strong Areas</h3>
                <ul className="space-y-1.5">
                  {scores.strong_areas.map((s, i) => (
                    <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">✓</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {scores.weak_areas?.length && (
              <div className="glass-card">
                <h3 className="text-sm font-semibold text-amber-400 mb-3">Areas to Improve</h3>
                <ul className="space-y-1.5">
                  {scores.weak_areas.map((s, i) => (
                    <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">!</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {scores.top_improvements?.length && (
          <div className="glass-card">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Top Recommendations</h3>
            <ul className="space-y-2">
              {scores.top_improvements.map((s, i) => (
                <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                  <span className="text-brand-400 mt-0.5">→</span> {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => { setStep('setup'); setSession(null); setQIndex(0) }} className="btn-secondary flex-1">
            Try Again
          </button>
          <button
            onClick={() => downloadReportMutation.mutate()}
            disabled={downloadReportMutation.isPending}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {downloadReportMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <><Download className="w-4 h-4" /> Download Report</>
            )}
          </button>
        </div>
      </div>
    )
  }

  return null
}
