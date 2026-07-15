import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, MicOff, Clock, ChevronRight, Brain } from 'lucide-react'
import type { InterviewQuestion } from '@/types'

interface MockInterviewProps {
  question: InterviewQuestion
  questionIndex: number
  totalQuestions: number
  onSubmit: (answer: string) => void
  isSubmitting: boolean
  feedback?: string
  score?: number
}

export default function MockInterviewScreen({
  question,
  questionIndex,
  totalQuestions,
  onSubmit,
  isSubmitting,
  feedback,
  score,
}: MockInterviewProps) {
  const [answer, setAnswer] = useState('')
  const [timeLeft, setTimeLeft] = useState(120)
  const [isRecording, setIsRecording] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setAnswer('')
    setTimeLeft(120)
    setShowFeedback(false)
  }, [question.id])

  useEffect(() => {
    if (feedback) setShowFeedback(true)
  }, [feedback])

  useEffect(() => {
    if (timeLeft <= 0 || showFeedback) return
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000)
    return () => clearInterval(t)
  }, [timeLeft, showFeedback])

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  const handleSubmit = () => {
    if (answer.trim()) onSubmit(answer)
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i < questionIndex
                  ? 'bg-emerald-500 w-8'
                  : i === questionIndex
                  ? 'bg-brand-500 w-12'
                  : 'bg-white/10 w-8'
              }`}
            />
          ))}
        </div>
        <div className={`flex items-center gap-2 text-sm font-mono px-3 py-1.5 rounded-xl border
          ${timeLeft < 30
            ? 'text-red-400 border-red-500/30 bg-red-500/10'
            : 'text-slate-400 border-white/10 bg-white/5'
          }`}>
          <Clock className="w-3.5 h-3.5" />
          {fmt(timeLeft)}
        </div>
      </div>

      {/* AI Interviewer Card */}
      <div className="glass-card flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-gradient flex items-center justify-center flex-shrink-0">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-brand-400">AI Interviewer</span>
            <span className="badge-info">Question {questionIndex + 1}/{totalQuestions}</span>
            <span className="badge bg-white/5 text-slate-400 border border-white/10">{question.category}</span>
          </div>
          <motion.p
            key={question.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-slate-200 text-lg leading-relaxed"
          >
            {question.question}
          </motion.p>
        </div>
      </div>

      {/* Answer Area */}
      <div className="glass-card flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Your Answer</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600">{answer.length} chars</span>
            <button
              onClick={() => setIsRecording((p) => !p)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-white/5 text-slate-500 border border-white/10 hover:text-slate-300'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <textarea
          ref={textareaRef}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here... Use the STAR method (Situation, Task, Action, Result) for behavioral questions."
          className="flex-1 bg-transparent border border-white/5 rounded-xl p-4 text-slate-200
                     placeholder:text-slate-600 focus:outline-none focus:border-brand-500/30
                     resize-none text-sm leading-relaxed min-h-[160px]"
          disabled={showFeedback}
        />

        {!showFeedback && (
          <button
            onClick={handleSubmit}
            disabled={!answer.trim() || isSubmitting}
            className="btn-primary flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Answer
              </>
            )}
          </button>
        )}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {showFeedback && feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card border-l-4 border-l-brand-500"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-200">AI Feedback</h4>
              {score !== undefined && (
                <div className={`text-lg font-bold px-3 py-1 rounded-xl
                  ${score >= 8 ? 'text-emerald-400 bg-emerald-500/15' :
                    score >= 6 ? 'text-amber-400 bg-amber-500/15' :
                    'text-red-400 bg-red-500/15'}`}>
                  {score}/10
                </div>
              )}
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">{feedback}</p>
            <button className="mt-4 flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 transition-colors">
              Next Question <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
