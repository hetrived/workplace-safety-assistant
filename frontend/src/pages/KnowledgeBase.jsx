import { useState } from 'react'
import { Search, BookOpen, Shield, Zap, HardHat, Flame, AlertCircle, FileText, ExternalLink, Database } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || ''

const PDF_DOCS = [
  {
    id: 'pdf-1',
    file: 'OSHA_PPE_Requirements.pdf',
    title: 'OSHA PPE Requirements',
    category: 'PDF Document',
    ref: '29 CFR 1910.132–138',
    icon: HardHat,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    pages: 2,
    summary: 'Complete guide to Personal Protective Equipment standards including head, eye, hand, foot, and respiratory protection requirements with training obligations.',
  },
  {
    id: 'pdf-2',
    file: 'Chemical_Safety_HAZMAT.pdf',
    title: 'Chemical Safety & HAZMAT',
    category: 'PDF Document',
    ref: '29 CFR 1910.1200',
    icon: AlertCircle,
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    pages: 2,
    summary: 'Hazard Communication Standard, SDS 16-section guide, chemical storage, spill response procedures, HAZMAT DOT classification and emergency contacts.',
  },
  {
    id: 'pdf-3',
    file: 'Fire_Prevention_Emergency.pdf',
    title: 'Fire Prevention & Emergency',
    category: 'PDF Document',
    ref: '29 CFR 1910.157',
    icon: Flame,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    pages: 2,
    summary: 'Fire extinguisher types (A/B/C/D/K), PASS technique, evacuation procedures, fire watch requirements, and Emergency Action Plan components.',
  },
  {
    id: 'pdf-4',
    file: 'Electrical_Safety_LOTO.pdf',
    title: 'Electrical Safety & LOTO',
    category: 'PDF Document',
    ref: '29 CFR 1910.147',
    icon: Zap,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    pages: 2,
    summary: 'Lockout/Tagout 7-step procedure, arc flash PPE categories, GFCI requirements, electrical hazard statistics, and minimum approach distances per NFPA 70E.',
  },
  {
    id: 'pdf-5',
    file: 'Fall_Protection_Standards.pdf',
    title: 'Fall Protection Standards',
    category: 'PDF Document',
    ref: '29 CFR 1926.502',
    icon: Shield,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    pages: 2,
    summary: 'Guardrail specifications, Personal Fall Arrest System requirements, ladder safety rules, scaffolding standards, and fall protection training requirements.',
  },
]

const KB_DOCS = [
  { id: 'kb-1', title: 'Forklift Safety', category: 'Equipment Safety', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10', content: 'Only certified operators may operate forklifts. Pre-shift inspection mandatory. Always wear seatbelt. Pedestrians always have right-of-way. Travel with load low.' },
  { id: 'kb-2', title: 'Confined Space Entry', category: 'Hazardous Operations', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10', content: 'Permit-required confined spaces need entry permits. Atmospheric testing required: oxygen 19.5–23.5%. Continuous monitoring during entry. Attendant required at all times.' },
  { id: 'kb-3', title: 'Heat Illness Prevention', category: 'Worker Health', icon: BookOpen, color: 'text-orange-400', bg: 'bg-orange-400/10', content: 'Provide water, rest, and shade. New workers need acclimatization. Heat stroke is life-threatening — call 911, move to cool area, apply ice packs to neck/armpits/groin.' },
  { id: 'kb-4', title: 'Incident Reporting', category: 'Compliance', icon: FileText, color: 'text-purple-400', bg: 'bg-purple-400/10', content: 'All workplace incidents must be reported immediately to supervisor. Fatalities and hospitalizations reported to OSHA within 8 hours. Amputations/eye loss within 24 hours.' },
  { id: 'kb-5', title: 'Noise & Hearing Conservation', category: 'Worker Health', icon: Shield, color: 'text-green-400', bg: 'bg-green-400/10', content: 'Hearing protection required when noise exposure exceeds 85 dB(A) TWA. Annual audiometric testing required. Insert earplugs reduce noise by 15–30 dB. Earmuffs: 15–25 dB.' },
]

export default function KnowledgeBase() {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('pdfs')
  const [expanded, setExpanded] = useState(null)

  const filteredPdfs = PDF_DOCS.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.summary.toLowerCase().includes(search.toLowerCase())
  )
  const filteredKb = KB_DOCS.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.content.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="card">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-safety-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search safety documents and guidelines..."
            className="w-full bg-safety-bg border border-safety-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-safety-text placeholder:text-safety-muted focus:outline-none focus:border-safety-orange transition-colors"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => setTab('pdfs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${tab === 'pdfs' ? 'bg-safety-orange text-white' : 'bg-safety-bg border border-safety-border text-safety-muted hover:text-safety-text'}`}
          >
            <FileText size={13} /> PDF Documents (5)
          </button>
          <button
            onClick={() => setTab('kb')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${tab === 'kb' ? 'bg-safety-orange text-white' : 'bg-safety-bg border border-safety-border text-safety-muted hover:text-safety-text'}`}
          >
            <BookOpen size={13} /> Safety Guidelines (5)
          </button>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-safety-muted">
            <Database size={12} className="text-green-400" />
            <span className="text-green-400 font-medium">Indexed in Databricks</span>
          </div>
        </div>
      </div>

      {/* PDF Documents Tab */}
      {tab === 'pdfs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPdfs.map(doc => {
            const Icon = doc.icon
            return (
              <div key={doc.id} className="card hover:border-safety-orange/50 transition-all duration-200 animate-fade-in flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${doc.bg}`}>
                    <Icon size={18} className={doc.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-safety-text leading-snug">{doc.title}</p>
                    <span className="text-xs text-safety-muted">{doc.ref}</span>
                  </div>
                  <span className="text-[10px] bg-safety-border text-safety-muted px-2 py-0.5 rounded-full shrink-0">PDF</span>
                </div>
                <p className="text-xs text-safety-muted leading-relaxed flex-1">{doc.summary}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-safety-border">
                  <span className="text-[10px] text-safety-muted flex items-center gap-1">
                    <Database size={10} className="text-green-400" /> Databricks indexed
                  </span>
                  <a
                    href={`${API_URL}/data/pdfs/${doc.file}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-safety-orange hover:underline"
                    onClick={e => e.stopPropagation()}
                  >
                    <ExternalLink size={11} /> View PDF
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Safety Guidelines Tab */}
      {tab === 'kb' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredKb.map(doc => {
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
      )}
    </div>
  )
}
