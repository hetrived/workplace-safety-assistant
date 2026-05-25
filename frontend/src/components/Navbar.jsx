import { useLocation } from 'react-router-dom'
import { Search, User } from 'lucide-react'
import NotificationBell from './NotificationBell'

const titles = {
  '/':          { title: 'Dashboard',      sub: 'Safety analytics and overview' },
  '/chat':      { title: 'Safety Chat',    sub: 'Ask AI-powered safety questions' },
  '/knowledge': { title: 'Knowledge Base', sub: 'OSHA guidelines and safety manuals' },
  '/incidents': { title: 'Incidents',      sub: 'Report and manage safety incidents' },
}

export default function Navbar() {
  const { pathname } = useLocation()
  const { title, sub } = titles[pathname] || titles['/']

  return (
    <header className="h-16 bg-safety-sidebar border-b border-safety-border flex items-center justify-between px-6 shrink-0">
      <div>
        <h1 className="font-bold text-safety-text text-lg leading-tight">{title}</h1>
        <p className="text-safety-muted text-xs">{sub}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-safety-muted" />
          <input
            placeholder="Search safety docs..."
            className="bg-safety-card border border-safety-border text-sm text-safety-text placeholder:text-safety-muted rounded-lg pl-9 pr-4 py-2 w-52 focus:outline-none focus:border-safety-orange transition-colors"
          />
        </div>

        <NotificationBell />

        <div className="flex items-center gap-2 pl-3 border-l border-safety-border">
          <div className="w-8 h-8 bg-safety-orange rounded-full flex items-center justify-center">
            <User size={15} className="text-white" />
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-safety-text">Safety Manager</p>
            <p className="text-xs text-safety-muted">Admin</p>
          </div>
        </div>
      </div>
    </header>
  )
}
