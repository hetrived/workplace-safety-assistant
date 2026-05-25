import { NavLink } from 'react-router-dom'
import { LayoutDashboard, MessageSquare, BookOpen, AlertTriangle, Shield } from 'lucide-react'

const nav = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard'      },
  { to: '/chat',      icon: MessageSquare,   label: 'Safety Chat'    },
  { to: '/knowledge', icon: BookOpen,        label: 'Knowledge Base' },
  { to: '/incidents', icon: AlertTriangle,   label: 'Incidents'      },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-safety-sidebar border-r border-safety-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-safety-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-safety-orange rounded-lg flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-safety-text text-sm leading-tight">SafetyAI</p>
            <p className="text-safety-muted text-xs">Workplace Assistant</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-safety-muted text-xs font-semibold uppercase tracking-wider mb-3 px-3">Menu</p>
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-safety-orange text-white shadow-lg shadow-orange-500/20'
                  : 'text-safety-muted hover:text-safety-text hover:bg-safety-border'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-safety-border">
        <div className="card !p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-safety-success rounded-full animate-pulse-slow" />
            <span className="text-xs text-safety-success font-medium">System Online</span>
          </div>
          <p className="text-xs text-safety-muted">Databricks Connected</p>
        </div>
      </div>
    </aside>
  )
}
