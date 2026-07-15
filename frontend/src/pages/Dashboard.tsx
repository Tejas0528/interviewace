import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import { FileText, Brain, Trophy, TrendingUp, Zap } from 'lucide-react'
import { analyticsApi } from '@/api/analytics'
import { resumeApi } from '@/api/resume'
import ScoreCard from '@/components/dashboard/ScoreCard'
import ProgressRing from '@/components/dashboard/ProgressRing'
import AgentStatusPanel from '@/components/dashboard/AgentStatus'
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton'
import type { AgentStatus } from '@/types'

const mockAgents: AgentStatus[] = [
  { name: 'Resume Analyzer', status: 'completed', message: 'Analysis complete' },
  { name: 'ATS Analyzer', status: 'completed', message: 'Score calculated' },
  { name: 'Interview Coach', status: 'idle' },
  { name: 'Career Coach', status: 'idle' },
  { name: 'Report Generator', status: 'idle' },
]

export default function Dashboard() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: analyticsApi.getDashboard,
  })

  const { data: resumeHistory } = useQuery({
    queryKey: ['resume-history'],
    queryFn: analyticsApi.getResumeHistory,
  })

  const { data: resumes } = useQuery({
    queryKey: ['resumes'],
    queryFn: resumeApi.getAll,
  })

  if (isLoading) return <DashboardSkeleton />

  const scoreTrend = analytics?.score_trend?.length
    ? analytics.score_trend
    : [{ date: 'Today', score: 0 }]

  // Get real resume & ATS scores from history
  const latestResume = resumeHistory?.history?.[resumeHistory.history.length - 1]
  const resumeScore = latestResume?.resume_score ?? null
  const atsScore = latestResume?.ats_score ?? null

  // Radar from actual session averages or zeros if no data
  const radarData = [
    { subject: 'Technical', A: analytics?.skill_breakdown?.technical_accuracy ?? 0 },
    { subject: 'Communication', A: analytics?.skill_breakdown?.communication ?? 0 },
    { subject: 'Behavioral', A: analytics?.skill_breakdown?.behavioral ?? 0 },
    { subject: 'STAR Method', A: analytics?.skill_breakdown?.star_method ?? 0 },
    { subject: 'Confidence', A: analytics?.skill_breakdown?.confidence ?? 0 },
    { subject: 'Professionalism', A: analytics?.skill_breakdown?.professionalism ?? 0 },
  ]

  const hasAnyData = (analytics?.total_sessions ?? 0) > 0 || resumes?.length

  return (
    <div className="space-y-6">
      {/* Hero greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card bg-brand-gradient border-0"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {hasAnyData ? 'Welcome back! Keep up the momentum 🚀' : 'Welcome to InterviewAce AI! 🚀'}
            </h2>
            <p className="text-white/70 text-sm">
              {hasAnyData
                ? 'Your interview readiness score is improving. Keep practicing!'
                : 'Upload your resume and start a mock interview to see your scores here.'
              }
            </p>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <ProgressRing
              value={analytics?.average_score ?? 0}
              size={80}
              color="#fff"
              sublabel="avg score"
            />
          </div>
        </div>
      </motion.div>

      {/* Score Cards — real data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreCard
          title="Resume Score"
          value={resumeScore !== null ? resumeScore : '—'}
          suffix={resumeScore !== null ? '/100' : ''}
          icon={<FileText className="w-5 h-5" />}
          iconBg="from-brand-500 to-indigo-600"
          description={resumeScore === null ? 'Upload & analyze a resume' : undefined}
        />
        <ScoreCard
          title="ATS Score"
          value={atsScore !== null ? atsScore : '—'}
          suffix={atsScore !== null ? '%' : ''}
          icon={<Zap className="w-5 h-5" />}
          iconBg="from-amber-500 to-orange-600"
          description={atsScore === null ? 'Run ATS analysis on resume' : undefined}
        />
        <ScoreCard
          title="Mock Interviews"
          value={analytics?.total_sessions ?? 0}
          icon={<Brain className="w-5 h-5" />}
          iconBg="from-purple-500 to-pink-600"
          description={!analytics?.total_sessions ? 'Start your first interview' : undefined}
        />
        <ScoreCard
          title="Interview Readiness"
          value={analytics?.average_score ?? 0}
          suffix="%"
          icon={<Trophy className="w-5 h-5" />}
          iconBg="from-emerald-500 to-teal-600"
          description={!analytics?.average_score ? 'Complete an interview to see' : undefined}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-slate-300">Score Trend</h3>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          {analytics?.score_trend?.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={scoreTrend}>
                <XAxis dataKey="date" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis domain={[0, 100]} stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#1a1a27', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12 }}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2}
                  dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-slate-600 text-sm">Complete mock interviews to see your score trend</p>
            </div>
          )}
        </div>

        <div className="glass-card">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Skill Radar</h3>
          {analytics?.total_sessions ? (
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-slate-600 text-sm text-center">Complete an interview to see skill breakdown</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Areas to Focus</h3>
          <div className="space-y-2">
            {analytics?.weak_areas?.length && analytics.weak_areas[0] !== 'Complete a mock interview to see insights' ? (
              analytics.weak_areas.map((area) => (
                <div key={area} className="flex items-center gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm text-slate-400">{area}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">Complete a mock interview to see personalized insights</p>
            )}
          </div>
          <h3 className="text-sm font-semibold text-slate-300 mb-3 mt-4">Strong Areas</h3>
          <div className="space-y-2">
            {analytics?.strong_areas?.length && analytics.strong_areas[0] !== 'Complete a mock interview to see insights' ? (
              analytics.strong_areas.map((area) => (
                <div key={area} className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm text-slate-400">{area}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">Strong areas will appear after completing interviews</p>
            )}
          </div>
        </div>

        <div className="glass-card">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Recent Interviews</h3>
          <div className="space-y-3">
            {analytics?.recent_sessions?.length ? (
              analytics.recent_sessions.slice(0, 4).map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-sm text-slate-300">{s.type}</p>
                    <p className="text-xs text-slate-600">{s.date} · {s.duration_minutes}min</p>
                  </div>
                  <span className={`text-sm font-semibold ${s.score >= 70 ? 'text-emerald-400' : s.score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                    {s.score}%
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600 text-center py-4">No sessions yet. Start your first mock interview!</p>
            )}
          </div>
        </div>

        <AgentStatusPanel agents={mockAgents} />
      </div>
    </div>
  )
}
