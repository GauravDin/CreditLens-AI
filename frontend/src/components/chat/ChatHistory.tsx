// src/components/chat/ChatHistory.tsx
import React, { useEffect, useRef } from 'react'
import { ChatMessage } from '../../types/api'
import { MessageBubble } from './MessageBubble'
import { LoadingDots } from '../common/LoadingSkeleton'
import { AgentAvatar } from '../common/AgentAvatar'
import { MessagesSquare } from 'lucide-react'

interface ChatHistoryProps {
  messages: ChatMessage[]
  loading: boolean
}

export function ChatHistory({ messages, loading }: ChatHistoryProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 h-full scroll-smooth"
    >
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-12 px-6 h-full">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
            <MessagesSquare className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-400">Interactive Document Chatroom</h4>
          <p className="text-xs text-slate-500 max-w-xs mt-1.5 leading-relaxed">
            Ask specific credit questions about interest coverage ratios, distress scores, segments, or covenants.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <MessageBubble key={idx} message={msg} />
          ))}
          
          {/* Typing Indicator Bubble */}
          {loading && (
            <div className="flex gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-900 text-slate-100">
              <div className="flex-shrink-0">
                <AgentAvatar size="sm" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  AI Credit Analyst
                </span>
                <div className="flex items-center mt-1">
                  <LoadingDots />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
