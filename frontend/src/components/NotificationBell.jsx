import { useState, useEffect, useRef } from 'react'
import { Bell, X, CheckCheck, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react'
import { getNotifications, markNotificationRead } from '../api'

const icons = {
  critical: <AlertCircle size={15} className="text-red-400 shrink-0" />,
  warning:  <AlertTriangle size={15} className="text-yellow-400 shrink-0" />,
  info:     <Info size={15} className="text-blue-400 shrink-0" />,
  success:  <CheckCircle size={15} className="text-green-400 shrink-0" />,
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const unread = notifications.filter(n => !n.is_read).length

  const load = async () => {
    try {
      const data = await getNotifications()
      setNotifications(data)
    } catch {}
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleRead = async (id) => {
    try { await markNotificationRead(id) } catch {}
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const handleReadAll = () => {
    notifications.forEach(n => { if (!n.is_read) handleRead(n.id) })
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-lg hover:bg-safety-border transition-colors"
      >
        <Bell size={20} className="text-safety-muted" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-safety-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-slow">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-safety-card border border-safety-border rounded-xl shadow-2xl z-50 animate-fade-in">
          <div className="flex items-center justify-between p-4 border-b border-safety-border">
            <div>
              <p className="font-semibold text-sm">Notifications</p>
              <p className="text-xs text-safety-muted">{unread} unread</p>
            </div>
            <div className="flex gap-2">
              {unread > 0 && (
                <button onClick={handleReadAll} className="text-xs text-safety-orange hover:underline flex items-center gap-1">
                  <CheckCheck size={13} /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)}>
                <X size={16} className="text-safety-muted hover:text-safety-text" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-safety-muted text-sm py-8">No notifications</p>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => handleRead(n.id)}
                  className={`flex gap-3 p-4 border-b border-safety-border cursor-pointer hover:bg-safety-border/40 transition-colors ${!n.is_read ? 'bg-safety-border/20' : ''}`}
                >
                  <div className="mt-0.5">{icons[n.type] || icons.info}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${!n.is_read ? 'text-safety-text' : 'text-safety-muted'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-safety-muted mt-0.5 leading-relaxed">{n.message}</p>
                  </div>
                  {!n.is_read && <div className="w-2 h-2 bg-safety-orange rounded-full mt-1.5 shrink-0" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
