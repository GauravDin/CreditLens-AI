// src/components/chat/MessageInput.tsx
import React, { useState, KeyboardEvent } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface MessageInputProps {
  onSend: (text: string) => void
  disabled?: boolean
}

export function MessageInput({ onSend, disabled = false }: MessageInputProps) {
  const [text, setText] = useState('')

  const handleSend = () => {
    if (!text.trim()) return
    onSend(text)
    setText('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex gap-2.5 items-end bg-slate-900 border border-slate-800 rounded-xl p-2.5">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a credit analyst query... (Enter to send, Shift+Enter for new line)"
        disabled={disabled}
        rows={1}
        className="flex-1 bg-transparent border-0 focus:ring-0 text-xs text-slate-100 placeholder-slate-500 resize-none min-h-[38px] max-h-[120px] focus:outline-none p-1.5"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        className="w-10 h-10 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:pointer-events-none flex-shrink-0"
        aria-label="Send Message"
      >
        {disabled ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </button>
    </div>
  )
}
