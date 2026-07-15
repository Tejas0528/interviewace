import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, ChevronRight, Lightbulb, MessageSquare, GitBranch, DollarSign,
  Code2, Layers, Star, CheckCircle2, XCircle, TrendingUp, Clock, HelpCircle
} from 'lucide-react'
import apiClient from '@/api/client'

const COMPANIES = [
  { name: 'Google', logo: '🔵', color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/20' },
  { name: 'Amazon', logo: '🟠', color: 'from-orange-500/20 to-amber-500/20', border: 'border-orange-500/20' },
  { name: 'Microsoft', logo: '🟩', color: 'from-green-500/20 to-teal-500/20', border: 'border-green-500/20' },
  { name: 'Meta', logo: '🔵', color: 'from-blue-600/20 to-indigo-500/20', border: 'border-indigo-500/20' },
  { name: 'Apple', logo: '⚫', color: 'from-gray-500/20 to-slate-500/20', border: 'border-gray-500/20' },
  { name: 'Netflix', logo: '🔴', color: 'from-red-500/20 to-rose-500/20', border: 'border-red-500/20' },
  { name: 'Zoho', logo: '🟣', color: 'from-purple-500/20 to-violet-500/20', border: 'border-purple-500/20' },
  { name: 'Infosys', logo: '🔷', color: 'from-blue-400/20 to-cyan-400/20', border: 'border-blue-400/20' },
  { name: 'TCS', logo: '🔹', color: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/20' },
  { name: 'Wipro', logo: '💜', color: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-500/20' },
  { name: 'Accenture', logo: '🟤', color: 'from-amber-600/20 to-orange-600/20', border: 'border-amber-600/20' },
  { name: 'Cognizant', logo: '🔵', color: 'from-indigo-500/20 to-blue-500/20', border: 'border-indigo-500/20' },
]

const TABS = [
  { key: 'overview', label: 'Overview', icon: Building2 },
  { key: 'rounds', label: 'Rounds', icon: GitBranch },
  { key: 'questions', label: 'Questions', icon: MessageSquare },
  { key: 'tips', label: 'Tips', icon: Lightbulb },
  { key: 'faqs', label: 'FAQs', icon: HelpCircle },
]

export default function CompanyPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  const { data: guide, isLoading } = useQuery({
    queryKey: ['company', selected],
    queryFn: async () => {
      const { data } = await apiClient.get(`/interview/company/${encodeURIComponent(selected!)}`)
      return data
    },
    enabled: !!selected,
  })

  return (
    <div className="space-y-6">
      <div className="glass-card">
        <h3 className="section-title">Select a Company</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {COMPANIES.map((c) => (
            <button key={c.name} onClick={() => { setSelected(c.name); setActiveTab('overview') }}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all text-center
                bg-gradient-to-br ${c.color} ${c.border}
                ${selected === c.name ? 'ring-2 ring-brand-500/50 scale-105' : 'hover:scale-102 hover:border-white/25'}`}>
              <span className="text-2xl">{c.logo}</span>
              <span className="text-xs font-medium text-slate-300">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {isLoading ? (
              <div className="glass-card space-y-4">
                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-4 bg-white/5 rounded animate-pulse" />)}
              </div>
            ) : guide ? (
              <>
                <div className="glass-card flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-8 h-8 text-brand-400" />
                    <div>
                      <h2 className="text-xl font-bold text-white">{guide.company}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="badge-warning">{guide.difficulty}</span>
                        <span className="flex items-center gap-1 text-xs text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400" /> {guide.rating}/5
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-slate-500 text-xs">Duration</p>
                      <p className="text-slate-300 font-medium">{guide.hiring_process?.duration}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {TABS.map(({ key, label, icon: Icon }) => (
                    <button key={key} onClick={() => setActiveTab(key)}
                      className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-all
                        ${activeTab === key ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}>
                      <Icon className="w-4 h-4" /> {label}
                    </button>
                  ))}
                </div>

                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="glass-card">
                      <h3 className="text-sm font-semibold text-slate-300 mb-2">Company Overview</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{guide.overview}</p>
                    </div>
                    <div className="glass-card">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-sm font-semibold text-slate-300">Salary Range</h3>
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between"><span className="text-slate-500">Junior</span><span className="text-slate-300">{guide.salary_range?.junior}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Mid</span><span className="text-slate-300">{guide.salary_range?.mid}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Senior</span><span className="text-slate-300">{guide.salary_range?.senior}</span></div>
                      </div>
                    </div>
                    <div className="glass-card">
                      <div className="flex items-center gap-2 mb-2">
                        <Layers className="w-4 h-4 text-brand-400" />
                        <h3 className="text-sm font-semibold text-slate-300">Required Skills</h3>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Must Have</p>
                          <div className="flex flex-wrap gap-1.5">
                            {guide.required_skills?.must_have?.map((s: string) => <span key={s} className="badge-danger">{s}</span>)}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Good to Have</p>
                          <div className="flex flex-wrap gap-1.5">
                            {guide.required_skills?.good_to_have?.map((s: string) => <span key={s} className="badge-info">{s}</span>)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="glass-card">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <h3 className="text-sm font-semibold text-slate-300">Recent Trends</h3>
                      </div>
                      <ul className="space-y-1.5">
                        {guide.recent_trends?.map((t: string, i: number) => (
                          <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                            <span className="text-purple-400">›</span> {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'rounds' && (
                  <div className="glass-card">
                    <h3 className="text-sm font-semibold text-slate-300 mb-4">Interview Rounds</h3>
                    <div className="space-y-3">
                      {guide.interview_rounds?.map((round: any, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                          <div className="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0 text-xs text-brand-400 font-bold">
                            {round.round}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-slate-200">{round.name}</p>
                              <span className="badge bg-white/5 text-slate-500 border border-white/10">{round.duration}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{round.focus}</p>
                            <p className="text-xs text-brand-400 mt-1">💡 {round.tips}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'questions' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="glass-card">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="w-4 h-4 text-purple-400" />
                        <h3 className="text-sm font-semibold text-slate-300">Behavioral</h3>
                      </div>
                      <div className="space-y-3">
                        {guide.behavioral_questions?.map((q: any, i: number) => (
                          <div key={i} className="p-3 rounded-xl bg-white/3 border border-white/5">
                            <p className="text-sm text-slate-300">{q.question}</p>
                            <p className="text-xs text-slate-600 mt-1">{q.tips}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="glass-card">
                      <div className="flex items-center gap-2 mb-3">
                        <Code2 className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-sm font-semibold text-slate-300">Technical</h3>
                      </div>
                      <div className="space-y-3">
                        {guide.technical_questions?.map((q: any, i: number) => (
                          <div key={i} className="p-3 rounded-xl bg-white/3 border border-white/5">
                            <p className="text-sm text-slate-300">{q.question}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="badge bg-white/5 text-slate-500 border border-white/10">{q.category}</span>
                              <span className="badge-warning">{q.difficulty}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="glass-card">
                      <div className="flex items-center gap-2 mb-3">
                        <Layers className="w-4 h-4 text-amber-400" />
                        <h3 className="text-sm font-semibold text-slate-300">System Design</h3>
                      </div>
                      <div className="space-y-3">
                        {guide.system_design_questions?.map((q: any, i: number) => (
                          <div key={i} className="p-3 rounded-xl bg-white/3 border border-white/5">
                            <p className="text-sm text-slate-300">{q.question}</p>
                            <p className="text-xs text-slate-600 mt-1">{q.level} · {q.focus}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'tips' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="glass-card">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-sm font-semibold text-slate-300">Dos</h3>
                      </div>
                      <ul className="space-y-2">
                        {guide.dos?.map((d: string, i: number) => (
                          <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" /> {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="glass-card">
                      <div className="flex items-center gap-2 mb-3">
                        <XCircle className="w-4 h-4 text-red-400" />
                        <h3 className="text-sm font-semibold text-slate-300">Don'ts</h3>
                      </div>
                      <ul className="space-y-2">
                        {guide.donts?.map((d: string, i: number) => (
                          <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                            <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" /> {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="glass-card lg:col-span-2">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-4 h-4 text-amber-400" />
                        <h3 className="text-sm font-semibold text-slate-300">AI Preparation Tips</h3>
                      </div>
                      <ul className="space-y-2">
                        {guide.ai_tips?.map((t: string, i: number) => (
                          <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                            <ChevronRight className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" /> {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'faqs' && (
                  <div className="glass-card space-y-3">
                    <h3 className="section-title">Frequently Asked Questions</h3>
                    {guide.faqs?.map((faq: any, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-white/3 border border-white/5">
                        <p className="text-sm font-medium text-slate-300">{faq.question}</p>
                        <p className="text-xs text-slate-500 mt-1.5">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
