// src/components/common/ErrorBanner.tsx
import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorBannerProps {
  message: string
  onRetry?: () => void
  retryText?: string
}

export function ErrorBanner({ message, onRetry, retryText = 'Retry Operation' }: ErrorBannerProps) {
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-4xl mx-auto my-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-red-200">Execution Error Encountered</h4>
          <p className="text-sm text-red-300/80 mt-1">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-red-950/45 hover:bg-red-900/40 border border-red-500/30 text-red-200 text-xs font-bold rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {retryText}
        </button>
      )}
    </div>
  )
}
