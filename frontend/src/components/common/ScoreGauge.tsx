// src/components/common/ScoreGauge.tsx
import React, { useEffect, useState } from 'react'

interface ScoreGaugeProps {
  score: number
  rating: string
  size?: number
}

export function ScoreGauge({ score, rating, size = 180 }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    // Animate score from 0 to target over 1.5s
    let start = 0
    const end = score
    if (end === 0) return
    
    const duration = 1200 // ms
    const stepTime = 16 // ~60fps
    const steps = duration / stepTime
    const increment = end / steps
    
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setAnimatedScore(end)
        clearInterval(timer)
      } else {
        setAnimatedScore(Math.round(start * 10) / 10)
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [score])

  // Circular gauge geometry
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference

  // Select color band
  const getColor = (s: number) => {
    if (s >= 70) return '#10b981' // emerald-500 (APPROVE threshold)
    if (s >= 55) return '#3b82f6' // blue-500
    if (s >= 40) return '#f59e0b' // amber-500 (CONDITIONAL threshold)
    return '#ef4444'             // red-500 (DECLINE threshold)
  }

  const color = getColor(score)

  return (
    <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#334155"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated active progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>
      {/* Central content text */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-4xl font-extrabold font-display leading-none tracking-tight" style={{ color }}>
          {animatedScore.toFixed(1)}
        </span>
        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Score</span>
        <div 
          className="mt-1.5 px-3 py-0.5 rounded-full text-xs font-black shadow-lg shadow-black/30 border border-slate-700" 
          style={{ backgroundColor: '#1e293b', color }}
        >
          {rating}
        </div>
      </div>
    </div>
  )
}
