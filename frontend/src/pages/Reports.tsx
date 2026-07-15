import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FileDown, FileText, BarChart3, Map, Loader2, Download } from 'lucide-react'
import { analyticsApi } from '@/api/analytics'

const typeIcons = {
  interview: BarChart3,
  resume: FileText,
  career: Map,
}

const typeColors = {
  interview: 'from-brand-500 to-indigo-600',
  resume: 'from-amber-500 to-orange-600',
  career: 'from-emerald-500 to-teal-600',
}

export default function ReportsPage() {
  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: analyticsApi.getReports,
  })

  const downloadMutation = useMutation({
    mutationFn: analyticsApi.downloadReport,
    onSuccess: (blob, reportId) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${reportId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Reports</h2>
          <p className="text-sm text-slate-400">Download your interview and career reports</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card space-y-3 animate-pulse">
              <div className="h-10 w-10 bg-white/5 rounded-xl" />
              <div className="h-4 bg-white/5 rounded w-2/3" />
              <div className="h-3 bg-white/5 rounded w-full" />
              <div className="h-3 bg-white/5 rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : reports?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report, i) => {
            const Icon = typeIcons[report.type]
            const gradient = typeColors[report.type]
            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-card group"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>

                <h3 className="text-sm font-semibold text-slate-200 mb-1">{report.title}</h3>
                <p className="text-xs text-slate-600 mb-3">
                  {new Date(report.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">{report.summary}</p>

                <div className="flex items-center gap-2">
                  <span className={`badge ${
                    report.type === 'interview' ? 'badge-info' :
                    report.type === 'resume' ? 'badge-warning' :
                    'badge-success'
                  }`}>
                    {report.type}
                  </span>
                  <button
                    onClick={() => downloadMutation.mutate(report.id)}
                    disabled={downloadMutation.isPending && downloadMutation.variables === report.id}
                    className="ml-auto flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300
                               bg-brand-500/10 border border-brand-500/20 px-3 py-1.5 rounded-lg transition-all
                               hover:bg-brand-500/20"
                  >
                    {downloadMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    Download PDF
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card text-center py-16"
        >
          <FileDown className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-400 mb-2">No reports yet</h3>
          <p className="text-sm text-slate-600">
            Complete a mock interview or resume analysis to generate reports
          </p>
        </motion.div>
      )}
    </div>
  )
}
