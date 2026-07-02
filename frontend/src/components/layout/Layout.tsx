// src/components/layout/Layout.tsx
import React from 'react'
import { TopNav } from './TopNav'
import { Sidebar } from './Sidebar'

interface LayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
}

export function Layout({ children, showSidebar = true }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Top Header Navigation */}
      <TopNav />

      {/* Main Grid: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-76px)]">
        {showSidebar && <Sidebar />}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
