// src/pages/AnalyzePage.tsx
import React, { useState, useEffect } from 'react'
import { Layout } from '../components/layout/Layout'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAnalysis } from '../hooks/useAnalysis'
import { api } from '../api/client'
import { PlayCircle, Loader2, Sparkles, Building2, HelpCircle } from 'lucide-react'
import { AgentAvatar } from '../components/common/AgentAvatar'
import toast from 'react-hot-toast'

export function AnalyzePage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { state, dispatch } = useApp()
  const { runAnalysis, analysisStatus, elapsedTime } = useAnalysis()
  const navigate = useNavigate()

  const [loanAmount, setLoanAmount] = useState<string>('')
  const [loanCurrency, setLoanCurrency] = useState<string>('USD')
  const [filenames, setFilenames] = useState<string[]>([])
  const [fetchingFiles, setFetchingFiles] = useState(false)

  // Fetch session details from FastAPI to populate workspace summary
  useEffect(() => {
    if (!sessionId) {
      navigate('/')
      return
    }

    const loadSession = async () => {
      setFetchingFiles(true)
      try {
        const res = await api.sessionInfo(sessionId)
        const data = res.data
        setFilenames(data.filenames || [])
        
        // Push files metadata to global state so Sidebar can access them
        const dummyFiles = (data.filenames || []).map((name: string) => ({
          name,
          size: 0,
          type: '',
          status: 'completed' as const
        }))
        dispatch({ type: 'SET_UPLOADED_FILES', payload: dummyFiles })
      } catch (err: any) {
        console.error(err)
        toast.error('Session expired or unavailable. Redirecting to upload.')
        dispatch({ type: 'RESET_STATE' })
        navigate('/')
      } finally {
        setFetchingFiles(false)
      }
    }

    loadSession()
  }, [sessionId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionId) return

    const amount = loanAmount.trim() ? parseFloat(loanAmount.replace(/,/g, '')) : null
    if (amount !== null && isNaN(amount)) {
      toast.error('Please enter a valid numeric loan amount')
      return
    }

    runAnalysis(sessionId, amount, loanCurrency)
  }

  const currencies = [
    { code: 'USD', label: 'US Dollar ($)' },
    { code: 'EUR', label: 'Euro (€)' },
    { code: 'GBP', label: 'British Pound (£)' },
    { code: 'JPY', label: 'Japanese Yen (¥)' },
    { code: 'CNY', label: 'Chinese Yuan (¥)' },
    { code: 'CAD', label: 'Canadian Dollar (CA$)' },
    { code: 'AUD', label: 'Australian Dollar (A$)' },
    { code: 'CHF', label: 'Swiss Franc (CHF)' }
  ]

  const isRunning = analysisStatus === 'running'

  return (
    <Layout showSidebar={!isRunning}>
      {isRunning ? (
        /* Full screen skeleton / thinking loader for analysis stage */
        <div className="flex flex-col items-center justify-center text-center h-[calc(100vh-140px)] max-w-lg mx-auto space-y-6">
          <AgentAvatar size="lg" isAnalyzing={true} />
          
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold font-display text-slate-100 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              AI Credit Analysis in Progress
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed px-4">
              NVIDIA LLaMA 3.3 70B is evaluating operating margins, debt ratios, Altman indicators, and covenants. This usually takes 10 to 30 seconds.
            </p>
          </div>

          {/* Running Clock readout */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3 font-mono text-sm text-blue-400 font-bold">
            Elapsed Time: {elapsedTime}s
          </div>
        </div>
      ) : (
        /* Risk Configuration Form page */
        <div className="max-w-xl mx-auto py-6 space-y-6">
          <div className="border border-slate-800 bg-slate-900/60 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-black font-display text-slate-100 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-500" />
              Configure Analysis
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verify your workspace documents below and enter optional loan metrics to generate credit limits and asset-to-debt covenant targets.
            </p>

            {/* Document summary list card */}
            <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 space-y-2.5">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                Target Workspace Documents ({filenames.length})
              </span>
              {fetchingFiles ? (
                <div className="h-4 bg-slate-850 rounded w-1/2 animate-pulse" />
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2">
                  {filenames.map((name, idx) => (
                    <div key={idx} className="text-xs text-slate-300 font-medium truncate">
                      • {name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Input Config Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                  Requested Loan Amount (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 50,000,000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none placeholder-slate-600 transition-colors w-full h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                  Loan Currency
                </label>
                <select
                  value={loanCurrency}
                  onChange={(e) => setLoanCurrency(e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-2 text-slate-100 text-sm focus:outline-none transition-colors w-full h-11 cursor-pointer"
                >
                  {currencies.map(curr => (
                    <option key={curr.code} value={curr.code}>
                      {curr.label} ({curr.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl text-sm shadow-xl shadow-blue-600/20 transition-colors"
                >
                  <PlayCircle className="w-5 h-5 text-purple-300 animate-pulse" />
                  <span>Execute AI Credit Analysis</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
