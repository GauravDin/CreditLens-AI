// src/components/common/MetricCard.tsx
import React from 'react'

interface MetricCardProps {
  label: string
  value: string | number | null
  unit?: string
  benchmark?: string
  status?: 'success' | 'warning' | 'error' | 'neutral'
  className?: string
}

export function MetricCard({
  label,
  value,
  unit = '',
  benchmark,
  status = 'neutral',
  className = '',
}: MetricCardProps) {
  const getStatusBorder = (s: string) => {
    switch (s) {
      case 'success':
        return 'border-l-4 border-l-emerald-500'
      case 'warning':
        return 'border-l-4 border-l-amber-500'
      case 'error':
        return 'border-l-4 border-l-red-500'
      default:
        return ''
    }
  }

  const isNull = value === null || value === undefined

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition-colors ${getStatusBorder(status)} ${className}`}>
      <div>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
          {label}
        </span>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-black font-display tracking-tight ${isNull ? 'text-slate-600' : 'text-slate-100'}`}>
            {isNull ? '–' : value}
          </span>
          {!isNull && unit && (
            <span className="text-xs text-slate-400 font-semibold">{unit}</span>
          )}
        </div>
      </div>
      {benchmark && (
        <div className="mt-3 text-[10px] text-slate-400 font-semibold border-t border-slate-800/60 pt-2 flex items-center justify-between">
          <span>Benchmark</span>
          <span className="text-slate-300 font-bold">{benchmark}</span>
        </div>
      )}
    </div>
  )
}
