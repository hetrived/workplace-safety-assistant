import { useState } from 'react'
import { Search, BookOpen, Shield, Zap, HardHat, Flame, AlertCircle, Activity } from 'lucide-react'

const DOCS = [
  { id: '1', title: 'Personal Protective Equipment (PPE)', category: 'Equipment Safety', icon: HardHat, color: 'text-yellow-400', bg: 'bg-yellow-400/10', content: 'All workers must wear appropriate PPE including hard hats, safety glasses, steel-toed boots, and high-visibility vests when on the work floor. PPE must be inspected before each use and replaced if damaged.' },
  { id: '2', title: 'Chemical Hazard Handling', category: 'Hazardous Materials', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10', content: 'Before handling any chemical, review the Safety Data Sheet (SDS). Always use appropriate PPE. Eye wash stations must be within 10 seconds travel from hazardous chemical areas.' },
  { id: '3', title: 'Fire Safety & Emergency Evacuation', category: 'Emergency Procedures', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-400/10', content: 'Know the location of all fire extinguishers, fire alarms, and emergency exits. PASS technique: Pull pin, Aim at base, Squeeze handle, Sweep side to side.' },
  { id: '4', title: 'Lockout/Tagout Procedures', category: 'Equipment Safety', icon: Shield, color: 'text-blue-400', bg: 'bg-blue-400/10', content: 'Before servicing any machinery, follow LOTO: Notify affected employees, identify all energy sources, isolate, apply lockout devices, verify isolation. OSHA 29 CFR 1910.147.' },
  { id: '5', title: 'Incident Reporting Procedure', category: 'Compliance', icon: BookOpen, color: 'text-green-400', bg: 'bg-green-400/10', content: 'All workplace incidents must be reported immediately to supervisor. Fatalities and hospitalizations reported to OSHA within 8 hours.' },
  { id: '6', title: 'Working at Heights', category: 'Construction Safety', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-400/10', content: 'Fall protection required at 4 feet (general industry) or 6 feet (construction). Use guardrails, safety nets, or personal fall arrest systems.' },
  { id: '7', title: 'Forklift Safety', category: 'Equipment Safety', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10', content: 'Only certified operators may operate forklifts. Pre-shift inspection mandatory. Always wear seatbelt. Pedestrians always have right-of-way.' },
  { id: '8', title: 'Electrical Safety', category: 'Electrical Hazards', icon: Zap, color: 'text-blue-400', bg: 'bg-blue-400/10', content: 'Only qualified electricians may work on electrical systems. NFPA 70E compliance required for arc flash protection. Lock out electrical energy before maintenance.' },
  { id: '9', title: 'Confined Space Entry', category: 'Hazardous Operations', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10', content: 'Permit-required confined spaces need entry permits. Atmospheric testing required: oxygen 19.5-23.5%. Continuous monitoring during entry.' },
  { id: '10', title: 'Heat Illness Prevention', category: 'Worker Health', icon: Activity, color: 'text-orange-400', bg: 'bg-orange-400/10', content: 'Provide water, rest, and shade. New workers need acclimatization. Heat stroke is life-threatening — call 911, move to cool area, apply ice packs.' },
]

const CATEGORIES = ['All', ...new Set(DOCS.map(d => d.category))]

export default function KnowledgeBase() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [expanded, setExpanded] = useState(null)

  const filtered = DOCS.filter(d => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.content.toLowerCase().includes(search.toLowerCase()) ||
      d.category.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || d.category === category
    return matchSearch && matchCat
  })

  return (
    <div className="space-y-6">
      {/* Search + filter */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-safety-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search safety documents, OSHA guidelines..."
              className="w-full bg-safety-bg border border-safety-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-safety-text placeholder:text-safety-muted focus:outline-none focus:border-safety-orange transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-2 text-xs rounded-lg font-medium transition-all whitespace-nowrap ${
                  category === cat
                    ? 'bg-safety-orange text-white'
                    : 'bg-safety-bg border border-safety-border text-safety-muted hover:text-safety-text'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-safety-muted mt-3">{filtered.length} document{filtered.length !== 1 ? 's' : ''} found</p>
      </div>

      {/* Document grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(doc => {
          const Icon = doc.icon
          const isOpen = expanded === doc.id
          return (
            <div
              key={doc.id}
              className="card cursor-pointer hover:border-safety-orange/50 transition-all duration-200 animate-fade-in"
              onClick={() => setExpanded(isOpen ? null : doc.id)}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${doc.bg}`}>
                  <Icon size={18} className={doc.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-safety-text leading-snug">{doc.title}</p>
                  <span className="text-xs text-safety-muted">{doc.category}</span>
                </div>
              </div>
              <p className={`text-xs text-safety-muted leading-relaxed transition-all ${isOpen ? '' : 'line-clamp-2'}`}>
                {doc.content}
              </p>
              <button className="text-xs text-safety-orange mt-2 hover:underline">
                {isOpen ? 'Show less' : 'Read more'}
              </button>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card text-center py-12">
          <BookOpen size={40} className="text-safety-muted mx-auto mb-3" />
          <p className="text-safety-muted">No documents match your search.</p>
        </div>
      )}
    </div>
  )
}
