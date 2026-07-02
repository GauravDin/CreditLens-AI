// src/components/common/LoadingSkeleton.tsx
import React from 'react'

interface SkeletonProps {
  className?: string
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 animate-pulse ${className}`}>
      <div className="flex justify-between items-center">
        <div className="h-4 bg-slate-800 rounded w-1/3" />
        <div className="h-6 bg-slate-800 rounded-full w-12" />
      </div>
      <div className="h-8 bg-slate-800 rounded w-2/3" />
      <div className="space-y-2">
        <div className="h-3 bg-slate-800 rounded w-full" />
        <div className="h-3 bg-slate-800 rounded w-5/6" />
      </div>
    </div>
  )
}

export function SkeletonRow({ className = '' }: SkeletonProps) {
  return (
    <div className={`flex items-center justify-between py-3 border-b border-slate-800 animate-pulse ${className}`}>
      <div className="h-4 bg-slate-800 rounded w-1/4" />
      <div className="h-4 bg-slate-800 rounded w-12" />
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  )
}

export function LoadingDots() {
  return (
    <div className="flex items-center gap-1 py-1.5 px-2">
      <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  )
}
