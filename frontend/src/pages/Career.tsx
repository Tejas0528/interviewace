import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Map, Target, BookOpen, Code2, ChevronRight,
  Loader2, Plus, Download, Calendar, Award,
  TrendingUp, Clock, CheckCircle2
} from 'lucide-react'
import apiClient from '@/api/client'
import { downloadBlob } from '@/utils/helpers'
import toast from 'react-hot-toast'

interface Roadmap {
  current_role: string; target_role: string; target_company?: string
  timeline_months: number; readiness_score?: number
  milestones: { title: string; timeline: string; description: string; deliverables: string[]; resources: string[] }[]
  recommended_courses: { title: string; platform: string; url: string; duration: string; level: string; cost: string; priority: string; reason: string }[]
  recommended_projects: { title: string; description: string; technologies: string[]; difficulty: string; estimated_time: string; impact: string }[]
  certifications?: { name: string; provider: string; duration: string; cost: string; priority: string; url: string }[]
  books?: { title: string; author: string; focus: string; priority: string }[]
  weekly_schedule?: Record<string, string>
  skills_to_learn: string[]; skills_to_strengthen?: string[]
  networking_tips?: string[]; application_strategy?: string; salary_expectation?: string
  monthly_plan?: { month: number; focus: string; goals: string[]; tasks: string[]; milestone: string }[]
}

const TABS = [
  { key: 'milestones', label: 'Milestones', icon: Target },
  { key: 'monthly', label: 'Monthly Plan', icon: Calendar },
  { key: 'courses', label: 'Courses', icon: BookOpen },
  { key: 'projects', label: 'Projects', icon: Code2 },
  { key: 'schedule', label: 'Schedule', icon: Clock },
  { key: 'strategy', label: 'Strategy', icon: TrendingUp },
]

export default function CareerPage() {
  const [showForm, setShowForm] = useState(false)
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [activeTab, setActiveTab] = useState('milestones')
  const [form, setForm] = useState({ current_role: '', target_role: '', experience_years: 2, skills: '', target_company: '' })

  const generateMutation = useMutation({
    mutationFn: async (payload: typeof form) => {
      const { data } = await apiClient.post('/career/roadmap/generate', {
        current_role: payload.current_role.trim(),
        target_role: payload.target_role.trim(),
        experience_years: payload.experience_years,
        skills: payload.skills.split(',').map(s => s.trim()).filter(Boolean),
        target_company: payload.target_company.trim() || null,
        timeline_months: 6,
      })
      return data as Roadmap
    },
    onSuccess: (data) => {
      setRoadmap(data); setShowForm(false); setActiveTab('milestones')
      toast.success('Career roadmap generated!')
    },
    onError: (err: any) => toast.error(`Failed: ${err?.response?.data?.detail || 'Try again'}`),
  })

  const downloadMutation = useMutation({
    mutationFn: async () => {
      const r = await apiClient.post('/reports/generate', { type: 'career', source_id: 'roadmap' })
      const res = await apiClient.get(`/reports/${r.data.id}/download`, { responseType: 'blob' })
      return res.data as Blob
    },
    onSuccess: (blob) => { downloadBlob(blob, 'career_roadmap.pdf'); toast.success('Downloaded!') },
    onError: () => toast.error('Download failed'),
  })

  const handleGenerate = () => {
    if (!form.current_role.trim()) { toast.error('Enter your current role'); return }
    if (!form.target_role.trim()) { toast.error('Enter your target role'); return }
    generateMutation.mutate(form)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Career Roadmap</h2>
          <p className="text-sm text-slate-400">AI-generated personalized career path — works without API key</p>
        </div>
        <button onClick={() => setShowForm(p => !p)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancel' : roadmap ? 'New Roadmap' : 'Generate Roadmap'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="glass-card space-y-4">
              <h3 className="text-sm font-semibold text-slate-300">Your Career Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block">Current Role / Status *</label>
                  <input value={form.current_role} onChange={e => setForm(p => ({ ...p, current_role: e.target.value }))}
                    placeholder="e.g. Fresher, Junior Data Analyst, B.Tech Student" className="input-field" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block">Target Role *</label>
                  <input value={form.target_role} onChange={e => setForm(p => ({ ...p, target_role: e.target.value }))}
                    placeholder="e.g. Senior Data Scientist, Full Stack Engineer, MBA Finance" className="input-field" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block">Years of Experience</label>
                  <input type="number" min={0} max={30} value={form.experience_years}
                    onChange={e => setForm(p => ({ ...p, experience_years: Number(e.target.value) }))} className="input-field" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block">Dream Company (optional)</label>
                  <input value={form.target_company} onChange={e => setForm(p => ({ ...p, target_company: e.target.value }))}
                    placeholder="e.g. Google, Zoho, TCS, Freshworks" className="input-field" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-500 mb-1.5 block">Current Skills (comma separated)</label>
                  <input value={form.skills} onChange={e => setForm(p => ({ ...p, skills: e.target.value }))}
                    placeholder="Python, SQL, React, Excel, Machine Learning, Tally" className="input-field" />
                </div>
              </div>
              <button onClick={handleGenerate} disabled={!form.current_role.trim() || !form.target_role.trim() || generateMutation.isPending}
                className="btn-primary flex items-center gap-2">
                {generateMutation.isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating your personalized roadmap...</>
                  : <><Map className="w-4 h-4" /> Generate My Roadmap</>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {roadmap ? (
        <div className="space-y-5">
          <div className="glass-card bg-gradient-to-r from-brand-500/10 to-purple-500/10 border-brand-500/20">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Your Career Path</p>
                <h3 className="text-xl font-bold text-white">{roadmap.current_role} → {roadmap.target_role}</h3>
                {roadmap.target_company && <p className="text-sm text-brand-400 mt-1">🎯 Target: {roadmap.target_company}</p>}
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="text-center"><p className="text-2xl font-bold text-brand-400">{roadmap.timeline_months}</p><p className="text-xs text-slate-500">months</p></div>
                <div className="text-center"><p className="text-2xl font-bold text-purple-400">{roadmap.skills_to_learn?.length ?? 0}</p><p className="text-xs text-slate-500">skills to learn</p></div>
                <div className="text-center"><p className="text-2xl font-bold text-emerald-400">{roadmap.recommended_courses?.length ?? 0}</p><p className="text-xs text-slate-500">courses</p></div>
                <button onClick={() => downloadMutation.mutate()} disabled={downloadMutation.isPending}
                  className="btn-secondary text-sm flex items-center gap-2">
                  {downloadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} PDF
                </button>
              </div>
            </div>
            {roadmap.skills_to_learn?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-slate-500 mb-2">Skills to learn:</p>
                <div className="flex flex-wrap gap-1.5">
                  {roadmap.skills_to_learn.map(s => <span key={s} className="badge-info">{s}</span>)}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl border transition-all
                  ${activeTab === key ? 'bg-brand-500/20 text-brand-400 border-brand-500/30' : 'text-slate-500 hover:text-slate-300 border-transparent'}`}>
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          {activeTab === 'milestones' && (
            <div className="glass-card">
              <h3 className="section-title">🎯 Key Milestones</h3>
              <div className="space-y-4">
                {roadmap.milestones?.map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center text-sm font-bold text-white flex-shrink-0">{i + 1}</div>
                      {i < roadmap.milestones.length - 1 && <div className="w-0.5 flex-1 bg-white/5 mt-2" />}
                    </div>
                    <div className="pb-6 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="text-sm font-semibold text-slate-200">{m.title}</h4>
                        <span className="badge-info text-xs">{m.timeline}</span>
                      </div>
                      <p className="text-sm text-slate-500 mb-2">{m.description}</p>
                      {m.deliverables?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {m.deliverables.map(d => (
                            <span key={d} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> {d}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'monthly' && (
            <div className="space-y-3">
              {roadmap.monthly_plan?.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass-card">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-xs text-white/70">Month</span>
                      <span className="text-xl font-bold text-white leading-none">{m.month}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-sm font-semibold text-slate-200">{m.focus}</h4>
                        <span className="badge-info text-xs">{m.milestone}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {m.goals?.length > 0 && <div>{m.goals.map(g => <p key={g} className="text-xs text-slate-400 flex items-start gap-1.5"><span className="text-brand-400">›</span>{g}</p>)}</div>}
                        {m.tasks?.length > 0 && <div>{m.tasks.map(t => <p key={t} className="text-xs text-slate-400 flex items-start gap-1.5"><span className="text-emerald-400">✓</span>{t}</p>)}</div>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )) || <div className="glass-card text-center py-8 text-slate-500 text-sm">See Milestones tab for your timeline.</div>}
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="space-y-4">
              <div className="glass-card">
                <h3 className="section-title">📚 Recommended Courses</h3>
                <div className="space-y-3">
                  {roadmap.recommended_courses?.map((c, i) => (
                    <motion.a key={i} href={c.url} target="_blank" rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-white/3 border border-white/5 hover:border-brand-500/30 transition-all group">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${c.priority === 'High' ? 'bg-brand-500/20' : 'bg-white/5'}`}>📖</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-sm font-medium text-slate-200 group-hover:text-brand-400 transition-colors">{c.title}</p>
                          {c.priority === 'High' && <span className="badge-danger text-xs">Must Do</span>}
                        </div>
                        <p className="text-xs text-slate-500 mb-1">{c.platform} · {c.duration} · {c.cost}</p>
                        <p className="text-xs text-slate-600">{c.reason}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-brand-400 flex-shrink-0 transition-colors mt-1" />
                    </motion.a>
                  ))}
                </div>
              </div>
              {roadmap.books?.length && (
                <div className="glass-card">
                  <h3 className="section-title">📖 Must-Read Books</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {roadmap.books.map((b, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/3 border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-slate-300">{b.title}</p>
                          {b.priority === 'Must Read' && <span className="badge-warning text-xs">Must Read</span>}
                        </div>
                        <p className="text-xs text-slate-500">by {b.author}</p>
                        <p className="text-xs text-slate-600 mt-1">{b.focus}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {roadmap.certifications?.length && (
                <div className="glass-card">
                  <h3 className="section-title">🏆 Certifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {roadmap.certifications.map((c, i) => (
                      <a key={i} href={c.url} target="_blank" rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-white/3 border border-white/5 hover:border-brand-500/30 transition-all group">
                        <div className="flex items-center gap-2 mb-1">
                          <Award className="w-4 h-4 text-amber-400" />
                          <p className="text-sm font-medium text-slate-300 group-hover:text-brand-400">{c.name}</p>
                        </div>
                        <p className="text-xs text-slate-500">{c.provider} · {c.duration} · {c.cost}</p>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="glass-card">
              <h3 className="section-title">💻 Recommended Projects</h3>
              <div className="space-y-4">
                {roadmap.recommended_projects?.map((p, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    className="p-4 rounded-xl bg-white/3 border border-white/5">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold text-slate-200">{p.title}</h4>
                      <span className={`badge text-xs ${p.difficulty === 'Beginner' ? 'badge-success' : p.difficulty === 'Advanced' ? 'badge-danger' : 'badge-warning'}`}>{p.difficulty}</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{p.description}</p>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        {p.technologies?.map(t => <span key={t} className="text-xs px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">{t}</span>)}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-600">
                        <span>⏱ {p.estimated_time}</span>
                        <span>🎯 {p.impact}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roadmap.weekly_schedule && (
                <div className="glass-card">
                  <h3 className="section-title">📅 Weekly Schedule</h3>
                  <div className="space-y-2">
                    {Object.entries(roadmap.weekly_schedule).map(([day, task]) => (
                      <div key={day} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                        <span className="text-xs font-semibold text-brand-400 w-20 capitalize">{day}</span>
                        <span className="text-xs text-slate-400">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {roadmap.networking_tips?.length && (
                <div className="glass-card">
                  <h3 className="section-title">🤝 Networking Tips</h3>
                  <ul className="space-y-2">
                    {roadmap.networking_tips.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-400"><span className="text-brand-400 mt-0.5 flex-shrink-0">›</span>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'strategy' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roadmap.application_strategy && (
                <div className="glass-card"><h3 className="section-title">🎯 Application Strategy</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{roadmap.application_strategy}</p></div>
              )}
              {roadmap.salary_expectation && (
                <div className="glass-card"><h3 className="section-title">💰 Salary Expectation</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{roadmap.salary_expectation}</p></div>
              )}
              {roadmap.skills_to_strengthen?.length && (
                <div className="glass-card"><h3 className="section-title">💪 Skills to Strengthen</h3>
                  <div className="flex flex-wrap gap-2">{roadmap.skills_to_strengthen.map(s => <span key={s} className="badge-warning">{s}</span>)}</div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : !showForm ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card text-center py-16">
          <Map className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-400 mb-2">No roadmap yet</h3>
          <p className="text-sm text-slate-600 mb-6">Works for ALL departments — Engineering, MBA, Arts, Commerce, Medical, and more</p>
          <button onClick={() => setShowForm(true)} className="btn-primary mx-auto">Generate My Roadmap</button>
        </motion.div>
      ) : null}
    </div>
  )
}
