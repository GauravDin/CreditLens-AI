// src/pages/HomePage.tsx
import React, { useEffect, useState } from 'react'
import { Layout } from '../components/layout/Layout'
import { FileDropzone } from '../components/upload/FileDropzone'
import { FileList } from '../components/upload/FileList'
import { UploadProgress } from '../components/upload/UploadProgress'
import { useUpload } from '../hooks/useUpload'
import { useApp } from '../context/AppContext'
import { ArrowRight, History, PlayCircle, ShieldCheck, Sparkles, Database } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

interface RecentSession {
  sessionId: string
  companyName: string
  timestamp: string
}

export function HomePage() {
  const { uploadedFiles, uploadStatus, uploadFiles, removeFile } = useUpload()
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([])

  useEffect(() => {
    // Read recent sessions list
    try {
      const stored = localStorage.getItem('credit_ai_recent_sessions')
      if (stored) {
        setRecentSessions(JSON.parse(stored))
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  const handleNextStep = () => {
    if (!state.sessionId) {
      toast.error('Session ID is missing. Please re-upload files.')
      return
    }
    // Navigate to analyze page
    navigate(`/analyze/${state.sessionId}`)
  }

  const loadRecentSession = (sess: RecentSession) => {
    // Find if session can be resumed, load session ID
    dispatch({ type: 'RESET_STATE' })
    dispatch({ type: 'SET_SESSION_ID', payload: sess.sessionId })
    
    // Attempt to read cached analysis for this session if it is the current one
    try {
      const active = localStorage.getItem('credit_ai_session')
      if (active) {
        const parsed = JSON.parse(active)
        if (parsed.sessionId === sess.sessionId && parsed.analysis) {
          dispatch({ type: 'SET_ANALYSIS', payload: parsed.analysis })
          navigate(`/results/${sess.sessionId}`)
          toast.success(`Resumed analysis for ${sess.companyName}`)
          return
        }
      }
    } catch {}

    // Otherwise navigate to configure analysis
    navigate(`/analyze/${sess.sessionId}`)
    toast.success(`Loaded workspace session for ${sess.companyName}`)
  }

  const deleteRecentSession = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const next = [...recentSessions]
    next.splice(idx, 1)
    setRecentSessions(next)
    localStorage.setItem('credit_ai_recent_sessions', JSON.stringify(next))
    toast.success('Workspace session removed from history')
  }

  return (
    <Layout showSidebar={false}>
      <div className="max-w-4xl mx-auto space-y-8 py-6">
        
        {/* Active Session Resume Banner */}
        {state.sessionId && (
          <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <div>
                <span className="text-xs text-slate-400">Suspended Session Detected</span>
                <p className="text-sm font-bold text-slate-200">
                  You have an active session in progress ({state.sessionId.slice(0, 12)}...)
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(state.analysis ? `/results/${state.sessionId}` : `/analyze/${state.sessionId}`)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-xl transition-colors"
            >
              <span>Resume Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center space-y-4 py-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-blue-400 font-bold">
            <ShieldCheck className="w-4 h-4 text-purple-400 animate-pulse" />
            Llama-3.3-70b Cognitive Credit Underwriting
          </div>
          <h2 className="text-4xl sm:text-5xl font-black font-display text-slate-100 tracking-tight leading-tight">
            Enterprise Financial Analysis <br />
            <span className="bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
              Automated in Seconds
            </span>
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Upload financial disclosures, income ledgers, or asset spreadsheets. AI automatically extracts balance sheets, scores solvency, calculates Altman metrics, and drafts credit reports.
          </p>
        </div>

        {/* File dropzone area */}
        <div className="space-y-4">
          <FileDropzone 
            onFilesSelected={uploadFiles} 
            disabled={uploadStatus === 'uploading'} 
          />

          <UploadProgress 
            status={uploadStatus} 
            filesCount={uploadedFiles.length} 
          />

          <FileList 
            files={uploadedFiles} 
            onRemove={removeFile} 
            disabled={uploadStatus === 'uploading'} 
          />
        </div>

        {/* Action button to proceed */}
        {uploadStatus === 'done' && state.sessionId && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleNextStep}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl text-sm shadow-xl shadow-blue-600/25 transition-all transform hover:translate-x-1"
            >
              <span>Start Analyzing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Recent sessions grid */}
        {recentSessions.length > 0 && (
          <div className="border-t border-slate-900 pt-8 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              Recent Workspaces ({recentSessions.length})
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentSessions.slice(0, 4).map((sess, idx) => (
                <div
                  key={idx}
                  onClick={() => loadRecentSession(sess)}
                  className="p-4 bg-slate-900/60 border border-slate-900 hover:border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-900 transition-all flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-4">
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">
                      {new Date(sess.timestamp).toLocaleDateString()}
                    </span>
                    <strong className="text-slate-200 text-sm block truncate group-hover:text-blue-400 transition-colors">
                      {sess.companyName}
                    </strong>
                    <span className="text-[10px] text-slate-500 font-semibold block truncate mt-0.5">
                      Session: {sess.sessionId.slice(0, 8)}...
                    </span>
                  </div>
                  
                  <button
                    onClick={(e) => deleteRecentSession(idx, e)}
                    className="w-8 h-8 rounded-lg border border-slate-850 hover:border-red-500/20 text-slate-500 hover:text-red-400 hover:bg-red-500/5 flex items-center justify-center transition-colors"
                    title="Remove Session History"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}

function Trash2({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18"/>
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
      <line x1="10" x2="10" y1="11" y2="17"/>
      <line x1="14" x2="14" y1="11" y2="17"/>
    </svg>
  )
}
