import { Shield, User } from 'lucide-react'

function renderMarkdown(text) {
  return text
    .split('\n')
    .map((line, i) => {
      if (line.startsWith('# '))  return <h2 key={i} className="text-base font-bold text-safety-orange mt-3 mb-1">{line.slice(2)}</h2>
      if (line.startsWith('## ')) return <h3 key={i} className="text-sm font-bold text-safety-yellow mt-2 mb-1">{line.slice(3)}</h3>
      if (line.startsWith('### ')) return <h4 key={i} className="text-sm font-semibold text-safety-text mt-1">{line.slice(4)}</h4>
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={i} className="ml-4 list-disc text-sm">{formatInline(line.slice(2))}</li>
      }
      if (line.trim() === '') return <br key={i} />
      return <p key={i} className="text-sm leading-relaxed">{formatInline(line)}</p>
    })
}

function formatInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="font-semibold text-safety-text">{part.slice(2, -2)}</strong>
      : part
  )
}

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 animate-fade-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
        isUser ? 'bg-safety-blue' : 'bg-safety-orange'
      }`}>
        {isUser ? <User size={15} className="text-white" /> : <Shield size={15} className="text-white" />}
      </div>

      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <span className="text-xs text-safety-muted px-1">
          {isUser ? 'You' : 'SafetyAI'}
        </span>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-safety-blue text-white rounded-tr-sm'
            : 'bg-safety-card border border-safety-border text-safety-text rounded-tl-sm'
        }`}>
          {isUser ? message.content : <div className="space-y-0.5">{renderMarkdown(message.content)}</div>}
        </div>
        {message.sources && message.sources.length > 0 && (
          <div className="flex gap-1 flex-wrap px-1">
            {message.sources.map((s, i) => (
              <span key={i} className="text-[10px] bg-safety-border text-safety-muted px-2 py-0.5 rounded-full">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
