import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, Activity, TrendingUp, ShieldAlert, Users } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { getAnalytics, getIncidents } from '../api'

const COLORS = ['#EF4444', '#F59E0B', '#22C55E']

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-safety-text">{value}</p>
      <p className="text-sm font-medium text-safety-text">{label}</p>
      {sub && <p className="text-xs text-safety-muted">{sub}</p>}
    </div>
  </div>
)

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAnalytics(), getIncidents()])
      .then(([a, i]) => { setAnalytics(a); setIncidents(i.slice(0, 5)) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-safety-orange border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const stats = analytics || {}
  const pieData = [
    { name: 'High', value: stats.by_severity?.high || 0 },
    { name: 'Medium', value: stats.by_severity?.medium || 0 },
    { name: 'Low', value: stats.by_severity?.low || 0 },
  ]

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={AlertTriangle}  label="Total Incidents"    value={stats.total_incidents || 0}   color="bg-safety-orange"         />
        <StatCard icon={ShieldAlert}    label="Open Incidents"     value={stats.open_incidents || 0}    color="bg-red-500"               />
        <StatCard icon={CheckCircle}    label="Resolved"           value={stats.resolved_incidents || 0} color="bg-green-600"            />
        <StatCard icon={TrendingUp}     label="Compliance Rate"    value={`${stats.compliance_rate || 0}%`} color="bg-blue-600"         />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Line chart */}
        <div className="card xl:col-span-2">
          <p className="font-semibold mb-4 text-sm">Incident Trend (Monthly)</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats.monthly_trend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="month" stroke="#94A3B8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94A3B8" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1E293B', borderRadius: 8 }} />
              <Line type="monotone" dataKey="incidents" stroke="#F97316" strokeWidth={2.5} dot={{ fill: '#F97316', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card">
          <p className="font-semibold mb-4 text-sm">By Severity</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1E293B', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-safety-muted">{d.name}</span>
                </div>
                <span className="font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar chart + Recent incidents */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card">
          <p className="font-semibold mb-4 text-sm">Incidents by Category</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.by_category || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
              <XAxis type="number" stroke="#94A3B8" tick={{ fontSize: 11 }} />
              <YAxis dataKey="category" type="category" stroke="#94A3B8" tick={{ fontSize: 10 }} width={110} />
              <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1E293B', borderRadius: 8 }} />
              <Bar dataKey="count" fill="#F97316" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent incidents */}
        <div className="card">
          <p className="font-semibold mb-4 text-sm">Recent Incidents</p>
          <div className="space-y-3">
            {incidents.map(inc => (
              <div key={inc.id} className="flex items-center justify-between p-3 bg-safety-bg rounded-lg border border-safety-border">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-safety-text truncate">{inc.title}</p>
                  <p className="text-xs text-safety-muted">{inc.location}</p>
                </div>
                <div className="flex gap-2 ml-3 shrink-0">
                  <span className={`badge-${inc.severity}`}>{inc.severity}</span>
                  <span className={`badge-${inc.status}`}>{inc.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
