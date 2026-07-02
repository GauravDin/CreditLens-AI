// src/components/layout/Sidebar.tsx
import React from 'react'
import { useApp } from '../../context/AppContext'
import { FileText, Database, Calendar, User, ShieldAlert, Sparkles, Trash2 } from 'lucide-react'
import { FileTypeIcon } from '../common/FileTypeIcon'
import { useAnalysis } from '../../hooks/useAnalysis'
import { Link, useLocation } from 'react-router-dom'

export function Sidebar() {
  const { state } = useApp()
  const { resetAnalysis } = useAnalysis()
  const location = useLocation()

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const activeSessionId = state.sessionId
  const hasAnalysis = !!state.analysis

  return (
    <aside className="no-print w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-[calc(100vh-76px)]">
      {/* Session Header Card */}
      <div className="p-5 border-b border-slate-800 flex-shrink-0">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-1.5">
            <Database className="w-3.5 h-3.5 text-blue-500" />
            Active Workspace
          </span>
          <div className="text-sm font-bold text-slate-200 truncate">
            {activeSessionId 
              ? (hasAnalysis ? state.analysis?.financials?.company_name || activeSessionId : activeSessionId)
              : 'No Active Session'}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>{state.uploadedFiles.length} Document(s)</span>
            <span className={`px-2 py-0.5 rounded-full font-semibold ${
              hasAnalysis ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
            }`}>
              {hasAnalysis ? 'Analyzed' : 'Awaiting trigger'}
            </span>
          </div>
        </div>
      </div>

      {/* Uploaded Documents List */}
      <div className="flex-1 overflow-y-auto p-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-500" />
          Loaded Files
        </h3>

        {state.uploadedFiles.length === 0 ? (
          <div className="text-xs text-slate-500 italic py-4 border border-dashed border-slate-800 rounded-lg text-center">
            No files uploaded in session
          </div>
        ) : (
          <div className="space-y-2.5">
            {state.uploadedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
                <FileTypeIcon filename={file.name} className="w-8 h-8 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-200 truncate" title={file.name}>
                    {file.name}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {formatBytes(file.size)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Session Actions Footer */}
      <div className="p-5 border-t border-slate-800 bg-slate-900/60 space-y-3 flex-shrink-0">
        {activeSessionId && (
          <>

            <button
              onClick={resetAnalysis}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold bg-slate-800/20 border border-slate-800 text-red-400 hover:bg-red-950/20 hover:border-red-900/50 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Reset Active Session
            </button>
          </>
        )}
      </div>
    </aside>
  )
}
