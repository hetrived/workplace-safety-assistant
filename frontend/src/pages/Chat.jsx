import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Zap, Database, BookOpen } from 'lucide-react'
import ChatMessage from '../components/ChatMessage'
import { sendMessage } from '../api'

const QUICK = [
  'How many open incidents do we have?',
  'What PPE is required for chemical handling?',
  'Show me high severity incidents',
  'Explain lockout/tagout procedure',
  'What to do in case of fire?',
  'Fall protection requirements for heights?',
]

const WELCOME = {
  role: 'assistant',
  content: "Hello! I'm SafetyAI, your workplace safety assistant powered by **Databricks Genie Space** and **Knowledge Assistant**.\n\n## I can answer two types of questions:\n- **Data questions** — \"How many open incidents?\", \"Show high severity cases\" → queries your live Databricks data\n- **Safety knowledge** — PPE, OSHA guidelines, emergency procedures → searches 5 indexed safety PDF documents\n\nHow can I help you stay safe today?",
  sources: []
}

export default function Chat() {
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const submit = async (text) => {
    const q = text || input.trim()
    if (!q || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: q }])
    setLoading(true)
    try {
      const data = await sendMessage(q)
      setMessages(prev => [...prev, { role: 'assistant', content: data.response, sources: data.sources }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I am having trouble connecting. Please check your connection or contact your safety manager.',
        sources: []
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-128px)]">
      {/* Chat area */}
      <div className="flex-1 flex flex-col card !p-0 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-safety-border flex items-center gap-3">
          <div className="w-2 h-2 bg-safety-success rounded-full animate-pulse-slow" />
          <span className="text-sm font-medium">SafetyAI is online</span>
          <div className="ml-auto flex items-center gap-3">
            <span className="flex items-center gap-1 text-[10px] bg-safety-border text-safety-muted px-2 py-1 rounded-full">
              <Database size={9} className="text-green-400" /> Genie Space
            </span>
            <span className="flex items-center gap-1 text-[10px] bg-safety-border text-safety-muted px-2 py-1 rounded-full">
              <BookOpen size={9} className="text-safety-orange" /> Knowledge Assistant
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.map((m, i) => <ChatMessage key={i} message={m} />)}
          {loading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-safety-orange flex items-center justify-center shrink-0">
                <Loader2 size={15} className="text-white animate-spin" />
              </div>
              <div className="bg-safety-card border border-safety-border px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-safety-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-safety-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-safety-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-safety-border">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submit()}
              placeholder="Ask a safety question..."
              className="flex-1 bg-safety-bg border border-safety-border rounded-xl px-4 py-3 text-sm text-safety-text placeholder:text-safety-muted focus:outline-none focus:border-safety-orange transition-colors"
            />
            <button
              onClick={() => submit()}
              disabled={!input.trim() || loading}
              className="btn-primary px-4 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="w-64 shrink-0 space-y-4">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-safety-yellow" />
            <p className="text-sm font-semibold">Quick Questions</p>
          </div>
          <div className="space-y-2">
            {QUICK.map((q, i) => (
              <button
                key={i}
                onClick={() => submit(q)}
                className="w-full text-left text-xs text-safety-muted hover:text-safety-text bg-safety-bg hover:bg-safety-border border border-safety-border rounded-lg px-3 py-2.5 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="card border-safety-orange/30 bg-safety-orange/5">
          <p className="text-xs font-semibold text-safety-orange mb-1">Emergency?</p>
          <p className="text-xs text-safety-muted">Call emergency services immediately: <span className="text-white font-bold">911</span></p>
        </div>
      </div>
    </div>
  )
}
