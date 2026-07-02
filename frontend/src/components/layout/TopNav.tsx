// src/components/layout/TopNav.tsx
import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Landmark, Wifi, WifiOff } from 'lucide-react'
import { api } from '../../api/client'

export function TopNav() {
  const location = useLocation()
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await api.health()
        setIsOnline(true)
      } catch {
        setIsOnline(false)
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="no-print bg-slate-900 border-b border-slate-800 sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <Landmark className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-display text-slate-100 leading-none">CreditLens AI</h1>
          <span className="text-xs text-slate-400">Enterprise Risk Officer Portal</span>
        </div>
      </div>

      <nav className="flex items-center gap-6">
        <Link 
          to="/" 
          className={`text-sm font-semibold transition-colors ${
            location.pathname === '/' ? 'text-blue-500' : 'text-slate-300 hover:text-white'
          }`}
        >
          Home
        </Link>
        
        {/* Offline indicator banner */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
          isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400 animate-pulse'
        }`}>
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5" />
              <span>Backend Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              <span>Backend Offline (port 8000)</span>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
