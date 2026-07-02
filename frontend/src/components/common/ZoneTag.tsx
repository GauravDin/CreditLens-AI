// src/components/common/ZoneTag.tsx
import React from 'react'

interface ZoneTagProps {
  zone: 'Safe' | 'Grey' | 'Distress' | string
  className?: string
}

export function ZoneTag({ zone, className = '' }: ZoneTagProps) {
  const getStyles = (z: string) => {
    switch (z) {
      case 'Safe':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
      case 'Grey':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400'
      case 'Distress':
        return 'bg-red-500/10 border-red-500/30 text-red-400'
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300'
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 border rounded text-xs font-bold ${getStyles(zone)} ${className}`}>
      {zone} Zone
    </span>
  )
}
