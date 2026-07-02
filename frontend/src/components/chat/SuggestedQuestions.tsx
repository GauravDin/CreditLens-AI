import React from 'react'
import { HelpCircle, Loader2 } from 'lucide-react'

interface SuggestedQuestionsProps {
  questions: string[]
  onQuestionClick: (q: string) => void
  disabled?: boolean
  loading?: boolean
}

export function SuggestedQuestions({ questions, onQuestionClick, disabled = false, loading = false }: SuggestedQuestionsProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Generating contextual suggestions...</span>
      </div>
    )
  }

  if (!questions || questions.length === 0) return null

  return (
    <div className="space-y-2.5 mt-4 mb-2">
      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5 pl-1">
        <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
        Suggested Prompts based on Document
      </span>
      <div className="flex flex-wrap gap-2">
        {questions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onQuestionClick(q)}
            disabled={disabled}
            className="text-[10px] text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 px-3 py-1.5 rounded-lg text-left transition-colors font-medium disabled:opacity-40 disabled:pointer-events-none"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
