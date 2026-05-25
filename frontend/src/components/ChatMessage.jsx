import { Shield, User } from 'lucide-react'

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
          {message.content}
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
