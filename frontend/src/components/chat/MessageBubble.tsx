// src/components/chat/MessageBubble.tsx
import React, { useState } from 'react'
import { ChatMessage } from '../../types/api'
import { AgentAvatar } from '../common/AgentAvatar'
import { User, Copy, Check } from 'lucide-react'

interface MessageBubbleProps {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const isBot = message.role === 'assistant'

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex gap-3 p-4 rounded-xl ${
      isBot ? 'bg-slate-900/60 border border-slate-900 text-slate-100' : 'bg-blue-600/10 border border-blue-500/20 text-slate-200'
    } relative group`}>
      
      {/* Avatar column */}
      <div className="flex-shrink-0">
        {isBot ? (
          <AgentAvatar size="sm" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <User className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0 pr-6">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
          {isBot ? 'AI Credit Analyst' : 'You'}
        </span>
        <p className="text-xs leading-relaxed whitespace-pre-wrap select-text">
          {message.content}
        </p>
      </div>

      {/* Hover action - copy button */}
      <button
        onClick={handleCopy}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity w-7 h-7 rounded border border-slate-800 bg-slate-950/60 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:border-slate-700"
        title="Copy to Clipboard"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  )
}
