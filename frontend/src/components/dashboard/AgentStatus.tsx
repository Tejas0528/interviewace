import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react'
import type { AgentStatus } from '@/types'

interface AgentStatusPanelProps {
  agents: AgentStatus[]
}

const statusConfig = {
  idle: {
    icon: Circle,
    color: 'text-slate-600',
    bg: 'bg-slate-600/10',
    label: 'Idle',
  },
  running: {
    icon: Loader2,
    color: 'text-brand-400',
    bg: 'bg-brand-500/10',
    label: 'Running',
    spin: true,
  },
  completed: {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    label: 'Done',
  },
  error: {
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    label: 'Error',
  },
}

export default function AgentStatusPanel({ agents }: AgentStatusPanelProps) {
  return (
    <div className="glass-card">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Agent Workflow</h3>
      <div className="space-y-3">
        {agents.map((agent, i) => {
          const cfg = statusConfig[agent.status]
          const Icon = cfg.icon
          return (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${cfg.color} ${'spin' in cfg ? 'animate-spin' : ''}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300 truncate">{agent.name}</span>
                  <span className={`text-xs ${cfg.color}`}>{cfg.label}</span>
                </div>
                {agent.message && (
                  <p className="text-xs text-slate-600 truncate mt-0.5">{agent.message}</p>
                )}
                {agent.progress !== undefined && agent.status === 'running' && (
                  <div className="mt-1 h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-brand-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${agent.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
