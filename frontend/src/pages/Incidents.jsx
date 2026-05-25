import { useState, useEffect } from 'react'
import { Plus, X, AlertTriangle, Filter } from 'lucide-react'
import { getIncidents, createIncident, updateIncidentStatus } from '../api'

const SEVERITIES = ['All', 'high', 'medium', 'low']
const STATUSES   = ['All', 'open', 'investigating', 'resolved']

export default function Incidents() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [severity, setSeverity] = useState('All')
  const [status, setStatus] = useState('All')
  const [form, setForm] = useState({ title: '', description: '', severity: 'medium', location: '', reported_by: '' })
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try { setIncidents(await getIncidents()) } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = incidents.filter(i => {
    return (severity === 'All' || i.severity === severity) &&
           (status === 'All' || i.status === status)
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.location || !form.reported_by) return
    setSubmitting(true)
    try {
      const inc = await createIncident(form)
      setIncidents(prev => [inc, ...prev])
      setShowForm(false)
      setForm({ title: '', description: '', severity: 'medium', location: '', reported_by: '' })
    } catch {}
    setSubmitting(false)
  }

  const handleStatus = async (id, newStatus) => {
    try { await updateIncidentStatus(id, newStatus) } catch {}
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i))
  }

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap items-center">
          <Filter size={14} className="text-safety-muted" />
          {SEVERITIES.map(s => (
            <button key={s} onClick={() => setSeverity(s)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${severity === s ? 'bg-safety-orange text-white' : 'bg-safety-card border border-safety-border text-safety-muted hover:text-safety-text'}`}>
              {s === 'All' ? 'All Severity' : s}
            </button>
          ))}
          <span className="text-safety-border">|</span>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${status === s ? 'bg-safety-blue text-white' : 'bg-safety-card border border-safety-border text-safety-muted hover:text-safety-text'}`}>
              {s === 'All' ? 'All Status' : s}
            </button>
          ))}
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 whitespace-nowrap">
          <Plus size={16} /> Report Incident
        </button>
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-safety-border">
                {['Incident', 'Location', 'Reported By', 'Severity', 'Status', 'Date', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-safety-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-safety-muted text-sm">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-safety-muted text-sm">No incidents found</td></tr>
              ) : filtered.map(inc => (
                <tr key={inc.id} className="border-b border-safety-border hover:bg-safety-border/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-safety-text">{inc.title}</p>
                    <p className="text-xs text-safety-muted mt-0.5 max-w-xs truncate">{inc.description}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-safety-muted whitespace-nowrap">{inc.location}</td>
                  <td className="px-4 py-3 text-sm text-safety-muted whitespace-nowrap">{inc.reported_by}</td>
                  <td className="px-4 py-3"><span className={`badge-${inc.severity}`}>{inc.severity}</span></td>
                  <td className="px-4 py-3"><span className={`badge-${inc.status}`}>{inc.status}</span></td>
                  <td className="px-4 py-3 text-xs text-safety-muted whitespace-nowrap">
                    {inc.created_at ? new Date(inc.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={inc.status}
                      onChange={e => handleStatus(inc.id, e.target.value)}
                      className="bg-safety-bg border border-safety-border text-xs text-safety-text rounded-lg px-2 py-1.5 focus:outline-none focus:border-safety-orange cursor-pointer"
                    >
                      <option value="open">Open</option>
                      <option value="investigating">Investigating</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-safety-card border border-safety-border rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-safety-border">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-safety-orange" />
                <p className="font-semibold">Report New Incident</p>
              </div>
              <button onClick={() => setShowForm(false)}>
                <X size={18} className="text-safety-muted hover:text-safety-text" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {[
                { label: 'Incident Title *', key: 'title', placeholder: 'Brief description of the incident' },
                { label: 'Location *', key: 'location', placeholder: 'Zone A, Warehouse, Assembly Line...' },
                { label: 'Reported By *', key: 'reported_by', placeholder: 'Your name' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-safety-muted mb-1.5 block">{label}</label>
                  <input
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-safety-bg border border-safety-border rounded-lg px-3 py-2.5 text-sm text-safety-text placeholder:text-safety-muted focus:outline-none focus:border-safety-orange transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-safety-muted mb-1.5 block">Severity</label>
                <select
                  value={form.severity}
                  onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}
                  className="w-full bg-safety-bg border border-safety-border rounded-lg px-3 py-2.5 text-sm text-safety-text focus:outline-none focus:border-safety-orange transition-colors"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-safety-muted mb-1.5 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Provide additional details about the incident..."
                  rows={3}
                  className="w-full bg-safety-bg border border-safety-border rounded-lg px-3 py-2.5 text-sm text-safety-text placeholder:text-safety-muted focus:outline-none focus:border-safety-orange transition-colors resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 disabled:opacity-50">
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
