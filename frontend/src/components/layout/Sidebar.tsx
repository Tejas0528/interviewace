import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, FileText, Brain, Video, GraduationCap,
  Building2, BarChart3, Map, FileDown, Zap, LogOut
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/resume', icon: FileText, label: 'Resume' },
  { to: '/interview', icon: Brain, label: 'Interview Prep' },
  { to: '/mock-interview', icon: Video, label: 'Mock Interview' },
  { to: '/learning', icon: GraduationCap, label: 'Learning Hub' },
  { to: '/company', icon: Building2, label: 'Company Guide' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/career', icon: Map, label: 'Career Roadmap' },
  { to: '/reports', icon: FileDown, label: 'Reports' },
]

export default function Sidebar() {
  const { logout, user } = useAuth()
  const typedUser = user as any

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 flex-shrink-0 bg-dark-800 border-r border-white/5 flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">InterviewAce</h1>
            <p className="text-xs text-slate-500">AI Coach</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User profile */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors">
          <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">
              {typedUser?.full_name?.charAt(0).toUpperCase() ?? 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-200 truncate">{typedUser?.full_name}</p>
            <p className="text-xs text-slate-500 truncate">{typedUser?.email}</p>
          </div>
          <button
            onClick={logout}
            className="text-slate-500 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.aside>
  )
}
