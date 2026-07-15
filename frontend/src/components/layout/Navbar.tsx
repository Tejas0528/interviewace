import { Bell, Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/resume': 'Resume Analyzer',
  '/interview': 'Interview Preparation',
  '/mock-interview': 'Mock Interview',
  '/learning': 'Learning Hub',
  '/company': 'Company Guide',
  '/analytics': 'Analytics',
  '/career': 'Career Roadmap',
  '/reports': 'Reports',
}

export default function Navbar() {
  const location = useLocation()
  const title = titles[location.pathname] ?? 'InterviewAce'

  return (
    <header className="h-16 px-6 flex items-center justify-between border-b border-white/5 bg-dark-800/50 backdrop-blur-sm">
      <h2 className="text-lg font-semibold text-slate-100">{title}</h2>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-dark-700 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm
                       text-slate-300 placeholder:text-slate-600 focus:outline-none
                       focus:border-brand-500/50 w-48 transition-all focus:w-64"
          />
        </div>

        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl
                          bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200
                          hover:bg-white/10 transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
        </button>
      </div>
    </header>
  )
}
