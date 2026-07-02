// src/components/common/StatusBadge.tsx
import React from 'react'
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

interface StatusBadgeProps {
  status: 'APPROVE' | 'CONDITIONAL' | 'DECLINE' | string
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getStyles = (s: string) => {
    switch (s) {
      case 'APPROVE':
        return {
          wrapper: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        }
      case 'CONDITIONAL':
        return {
          wrapper: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />
        }
      case 'DECLINE':
        return {
          wrapper: 'bg-red-500/10 border-red-500/30 text-red-400',
          icon: <XCircle className="w-4 h-4 text-red-400" />
        }
      default:
        return {
          wrapper: 'bg-slate-800 border-slate-700 text-slate-300',
          icon: null
        }
    }
  }

  const design = getStyles(status)

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 border rounded-full text-xs font-black tracking-wide uppercase ${design.wrapper} ${className}`}>
      {design.icon}
      {status}
    </span>
  )
}
