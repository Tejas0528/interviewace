import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Zap, Wand2, Trash2, Download } from 'lucide-react'
import { useResume } from '@/hooks/useResume'
import ResumeUpload from '@/components/resume/ResumeUpload'
import ResumeScorePanel from '@/components/resume/ResumeScore'
import ATSReport from '@/components/resume/ATSReport'
import apiClient from '@/api/client'
import { downloadBlob } from '@/utils/helpers'
import toast from 'react-hot-toast'
import type { ResumeScore, ATSScore } from '@/types'

export default function ResumePage() {
  const { resumes, analyze, isAnalyzing, getATSScore, isGettingATS, improve, isImproving, deleteResume } = useResume()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [score, setScore] = useState<ResumeScore | null>(null)
  const [ats, setAts] = useState<ATSScore | null>(null)
  const [improved, setImproved] = useState<{ improved_content: string; changes: string[] } | null>(null)
  const [activeTab, setActiveTab] = useState<'score' | 'ats' | 'improve'>('score')
  const [jdText, setJdText] = useState('')

  const handleAnalyze = async (id: string) => {
    setSelectedId(id)
    const res = await analyze(id)
    setScore(res)
    setActiveTab('score')
  }

  const handleATS = async (id: string) => {
    setSelectedId(id)
    const res = await getATSScore({ id, jd: jdText || undefined })
    setAts(res)
    setActiveTab('ats')
  }

  const handleImprove = async (id: string) => {
    setSelectedId(id)
    const res = await improve(id)
    setImproved(res)
    setActiveTab('improve')
  }

  const downloadResume = async (id: string, format: 'pdf' | 'docx') => {
    try {
      const { data } = await apiClient.get(`/resume/${id}/download/${format}`, { responseType: 'blob' })
      downloadBlob(data, `resume_improved.${format}`)
      toast.success(`Resume downloaded as ${format.toUpperCase()}`)
    } catch {
      toast.error('Failed to download resume')
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <ResumeUpload />

          {/* Resume List */}
          {resumes.length > 0 && (
            <div className="glass-card">
              <h3 className="section-title">Your Resumes</h3>
              <div className="space-y-3">
                {resumes.map((r) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer
                      ${selectedId === r.id
                        ? 'bg-brand-500/10 border-brand-500/30'
                        : 'bg-white/3 border-white/5 hover:border-white/15'
                      }`}
                    onClick={() => setSelectedId(r.id)}
                  >
                    <div className="w-9 h-9 rounded-lg bg-brand-500/15 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-brand-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 truncate">{r.filename}</p>
                      <p className="text-xs text-slate-600">{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAnalyze(r.id) }}
                        disabled={isAnalyzing}
                        className="text-xs px-2 py-1 rounded-lg bg-brand-500/15 text-brand-400 hover:bg-brand-500/25 transition-colors"
                      >
                        {isAnalyzing && selectedId === r.id ? '...' : 'Analyze'}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteResume(r.id) }}
                        className="text-slate-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Actions for selected resume */}
              {selectedId && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3">
                  <textarea
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    placeholder="Paste job description for ATS analysis (optional)..."
                    className="input-field min-h-[80px] resize-none text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleATS(selectedId)}
                      disabled={isGettingATS}
                      className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
                    >
                      <Zap className="w-4 h-4" />
                      {isGettingATS ? 'Calculating...' : 'ATS Score'}
                    </button>
                    <button
                      onClick={() => handleImprove(selectedId)}
                      disabled={isImproving}
                      className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm"
                    >
                      <Wand2 className="w-4 h-4" />
                      {isImproving ? 'Improving...' : 'Improve Resume'}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Results Panel */}
        <AnimatePresence mode="wait">
          {(score || ats || improved) && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Tab Selector */}
              <div className="flex gap-2">
                {score && (
                  <button
                    onClick={() => setActiveTab('score')}
                    className={`text-sm px-4 py-2 rounded-xl transition-all ${activeTab === 'score' ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Resume Score
                  </button>
                )}
                {ats && (
                  <button
                    onClick={() => setActiveTab('ats')}
                    className={`text-sm px-4 py-2 rounded-xl transition-all ${activeTab === 'ats' ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    ATS Report
                  </button>
                )}
                {improved && (
                  <button
                    onClick={() => setActiveTab('improve')}
                    className={`text-sm px-4 py-2 rounded-xl transition-all ${activeTab === 'improve' ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Improved
                  </button>
                )}
              </div>

              {activeTab === 'score' && score && <ResumeScorePanel score={score} />}
              {activeTab === 'ats' && ats && <ATSReport ats={ats} />}
              {activeTab === 'improve' && improved && (
                <div className="glass-card space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="section-title mb-0">Improved Resume</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadResume(selectedId!, 'pdf')}
                        className="btn-secondary text-xs flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF
                      </button>
                      <button
                        onClick={() => downloadResume(selectedId!, 'docx')}
                        className="btn-secondary text-xs flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> DOCX
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Changes Made</h4>
                    <ul className="space-y-1.5">
                      {improved.changes.map((c, i) => (
                        <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                          <span className="text-emerald-400 mt-0.5">✓</span> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Improved Content Preview</h4>
                    <div className="bg-dark-700 rounded-xl p-4 text-sm text-slate-400 leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap font-mono">
                      {improved.improved_content}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
