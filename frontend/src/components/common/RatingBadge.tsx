// src/components/common/RatingBadge.tsx
import React from 'react'

interface RatingBadgeProps {
  rating: 'AAA' | 'AA' | 'BBB' | 'BB' | 'CCC' | string
  className?: string
}

export function RatingBadge({ rating, className = '' }: RatingBadgeProps) {
  const getStyles = (r: string) => {
    switch (r) {
      case 'AAA':
      case 'AA':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
      case 'BBB':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400'
      case 'BB':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400'
      case 'CCC':
        return 'bg-red-500/10 border-red-500/30 text-red-400'
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300'
    }
  }

  return (
    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-black border uppercase tracking-wider ${getStyles(rating)} ${className}`}>
      {rating}
    </span>
  )
}
