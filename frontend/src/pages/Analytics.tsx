import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { analyticsApi } from '@/api/analytics'
import ScoreCard from '@/components/dashboard/ScoreCard'
import { BarChart3, TrendingUp, Clock, Target } from 'lucide-react'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b']

const mockBarData = [
  { name: 'HR', score: 82 },
  { name: 'Technical', score: 68 },
  { name: 'Behavioral', score: 75 },
  { name: 'Mixed', score: 71 },
]

const mockPieData = [
  { name: 'HR', value: 4 },
  { name: 'Technical', value: 6 },
  { name: 'Behavioral', value: 3 },
  { name: 'Mixed', value: 5 },
]

export default function AnalyticsPage() {
  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: analyticsApi.getDashboard,
  })

  const scoreTrend = analytics?.score_trend ?? [
    { date: 'Week 1', score: 52 },
    { date: 'Week 2', score: 61 },
    { date: 'Week 3', score: 70 },
    { date: 'Week 4', score: 78 },
    { date: 'Week 5', score: 82 },
    { date: 'Week 6', score: 85 },
  ]

  const tooltipStyle = {
    contentStyle: { background: '#1a1a27', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12 },
    labelStyle: { color: '#94a3b8' },
    itemStyle: { color: '#818cf8' },
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreCard title="Total Sessions" value={analytics?.total_sessions ?? 18}
          icon={<BarChart3 className="w-5 h-5" />} iconBg="from-brand-500 to-indigo-600" />
        <ScoreCard title="Avg Score" value={analytics?.average_score ?? 76} suffix="%"
          change={analytics?.improvement_rate}
          icon={<Target className="w-5 h-5" />} iconBg="from-emerald-500 to-teal-600" />
        <ScoreCard title="Improvement" value={`+${analytics?.improvement_rate ?? 24}`} suffix="%"
          icon={<TrendingUp className="w-5 h-5" />} iconBg="from-purple-500 to-pink-600" />
        <ScoreCard title="Hours Practiced" value={42}
          icon={<Clock className="w-5 h-5" />} iconBg="from-amber-500 to-orange-600" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Progress Over Time */}
        <div className="glass-card">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Score Progress Over Time</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={scoreTrend}>
              <XAxis dataKey="date" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis domain={[0, 100]} stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5}
                dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Score by Type */}
        <div className="glass-card">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Score by Interview Type</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockBarData}>
              <XAxis dataKey="name" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis domain={[0, 100]} stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]}>
                {mockBarData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sessions Distribution */}
        <div className="glass-card">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Sessions Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={mockPieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {mockPieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Session History Table */}
        <div className="glass-card">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Session History</h3>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {(analytics?.recent_sessions ?? []).map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5">
                <div>
                  <p className="text-sm text-slate-300 font-medium">{s.type}</p>
                  <p className="text-xs text-slate-600">{s.date} · {s.duration_minutes}min</p>
                </div>
                <div className={`text-sm font-bold px-2.5 py-1 rounded-lg
                  ${s.score >= 75 ? 'text-emerald-400 bg-emerald-500/15' :
                    s.score >= 55 ? 'text-amber-400 bg-amber-500/15' :
                    'text-red-400 bg-red-500/15'}`}>
                  {s.score}%
                </div>
              </div>
            ))}
            {!analytics?.recent_sessions?.length && (
              <p className="text-center text-slate-600 py-4 text-sm">No sessions yet. Start your first mock interview!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
