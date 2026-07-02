// src/pages/ResultsPage.tsx
import React, { useEffect } from 'react'
import { Layout } from '../components/layout/Layout'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { api } from '../api/client'
import toast from 'react-hot-toast'
import { useStock } from '../hooks/useStock'

// Component Imports
import { DecisionBanner } from '../components/results/DecisionBanner'
import { QuickMetricsRow } from '../components/results/QuickMetricsRow'
import { ScoreGauge } from '../components/common/ScoreGauge'
import { AltmanZCard } from '../components/results/AltmanZCard'
import { IncomeStatementTable } from '../components/results/IncomeStatementTable'
import { BalanceSheetTable } from '../components/results/BalanceSheetTable'
import { CashFlowTable } from '../components/results/CashFlowTable'
import { SegmentsTable } from '../components/results/SegmentsTable'
import { RatioAnalysisTable } from '../components/results/RatioAnalysisTable'
import { ScoreBreakdownTable } from '../components/results/ScoreBreakdownTable'
import { StrengthsRisksPanel } from '../components/results/StrengthsRisksPanel'
import { MonitoringList } from '../components/results/MonitoringList'
import { ReportDownloadBar } from '../components/results/ReportDownloadBar'

// Chart Imports
import { RevenueChart } from '../components/charts/RevenueChart'
import { ScoreBreakdownChart } from '../components/charts/ScoreBreakdownChart'
import { RatioDashboardChart } from '../components/charts/RatioDashboardChart'

// Stock/Chat Imports
import { StockPanel } from '../components/stock/StockPanel'
import { ChatPage } from './ChatPage'

// Lucide Icons
import { 
  Presentation, 
  TrendingUp, 
  BarChart4, 
  AlertOctagon, 
  MessageCircle, 
  Info
} from 'lucide-react'

export function ResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { state, dispatch } = useApp()
  const navigate = useNavigate()

  // Pull analysis session details from cache/API on mount
  useEffect(() => {
    if (!sessionId) {
      navigate('/')
      return
    }

    const verifySession = async () => {
      if (state.analysis && state.sessionId === sessionId) return
      
      try {
        const res = await api.sessionInfo(sessionId)
        const sInfo = res.data

        if (!sInfo.has_analysis) {
          toast.error('Session analysis not generated yet. Configure analysis first.')
          navigate(`/analyze/${sessionId}`)
          return
        }

        // Fetch completed analysis result directly
        const resAnalysis = await api.analyze(sessionId, null, null)
        dispatch({ type: 'SET_SESSION_ID', payload: sessionId })
        dispatch({ type: 'SET_ANALYSIS', payload: resAnalysis.data })
        dispatch({ type: 'SET_ANALYSIS_STATUS', payload: 'done' })
      } catch (err: any) {
        console.error(err)
        toast.error('Session expired or unavailable.')
        dispatch({ type: 'RESET_STATE' })
        navigate('/')
      }
    }

    verifySession()
  }, [sessionId, state.analysis])

  const analysis = state.analysis
  const activeTab = state.activeTab

  if (!analysis) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center text-center h-[calc(100vh-140px)] space-y-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-slate-500">Loading analysis workspace...</p>
        </div>
      </Layout>
    )
  }

  // Save recent sessions to history to populate HomePage
  useEffect(() => {
    try {
      const recent = localStorage.getItem('credit_ai_recent_sessions')
      const list = recent ? JSON.parse(recent) : []
      const exists = list.find((item: any) => item.sessionId === sessionId)
      if (!exists && sessionId && analysis.financials?.company_name) {
        const updated = [
          {
            sessionId,
            companyName: analysis.financials.company_name,
            timestamp: new Date().toISOString()
          },
          ...list.slice(0, 4) // cap at 5
        ]
        localStorage.setItem('credit_ai_recent_sessions', JSON.stringify(updated))
      }
    } catch {}
  }, [sessionId, analysis])

  const { financials, score_breakdown, altman_z, decision, credit_score, credit_rating } = analysis
  const ticker = financials.ticker

  const tabs = [
    { id: 'overview', label: 'Executive Summary', icon: <Presentation className="w-4 h-4" /> },
    { id: 'financials', label: 'Financial Statements', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'scoring', label: 'Underwriting Score', icon: <BarChart4 className="w-4 h-4" /> },
    { id: 'risk', label: 'Covenants & Risks', icon: <AlertOctagon className="w-4 h-4" /> },
    { id: 'chat', label: 'Q&A Chatroom', icon: <MessageCircle className="w-4 h-4" /> },
  ] as const

  return (
    <Layout>
      <div className="pb-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Main Dashboard Panel */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Horizontal tab lists */}
            <div className="no-print flex border-b border-slate-800 bg-slate-900/40 p-1.5 rounded-xl gap-1.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab.id })}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 border border-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* TAB CONTENTS */}
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in print-expand">
                
                {/* Decision Header */}
                <DecisionBanner 
                  decision={decision} 
                  companyName={financials.company_name} 
                  currency={financials.currency}
                  unit={financials.unit}
                />

                {/* Grid score gauge + Altman card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Circular Score Gauge Card */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[220px]">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-4">
                      Compliance Score Gauge
                    </span>
                    <ScoreGauge score={credit_score} rating={credit_rating} />
                  </div>

                  {/* Altman Z Card */}
                  <div className="md:col-span-2">
                    <AltmanZCard altmanZ={altman_z} />
                  </div>

                </div>

                {/* 6 Grid KPIs */}
                <QuickMetricsRow financials={financials} />

              </div>
            )}

            {/* FINANCIALS TAB */}
            {activeTab === 'financials' && (
              <div className="space-y-6 animate-fade-in print-expand">
                {/* Dynamic comparison chart */}
                <RevenueChart financials={financials} />

                {/* Financial grids */}
                <IncomeStatementTable financials={financials} />
                <BalanceSheetTable financials={financials} />
                <CashFlowTable financials={financials} />
                
                {/* Segmentations */}
                <SegmentsTable 
                  segments={financials.segments} 
                  currency={financials.currency}
                  unit={financials.unit}
                />

                {/* Forecast info */}
                {(financials.forecast_revenue || financials.forecast_op_profit || financials.forecast_net_profit) && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      Forward Earnings Forecasts ({financials.currency} {financials.unit})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {financials.forecast_revenue && (
                        <div className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Forecast Revenue</span>
                          <span className="text-base font-black text-slate-200">{financials.forecast_revenue.toLocaleString()}</span>
                        </div>
                      )}
                      {financials.forecast_op_profit && (
                        <div className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Forecast Op. Profit</span>
                          <span className="text-base font-black text-slate-200">{financials.forecast_op_profit.toLocaleString()}</span>
                        </div>
                      )}
                      {financials.forecast_net_profit && (
                        <div className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Forecast Net Profit</span>
                          <span className="text-base font-black text-slate-200">{financials.forecast_net_profit.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Qualitative notes */}
                {financials.qualitative_notes && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-500" />
                      Business Context & Operations Description
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap select-text">
                      {financials.qualitative_notes}
                    </p>
                  </div>
                )}

              </div>
            )}

            {/* SCORING TAB */}
            {activeTab === 'scoring' && (
              <div className="space-y-6 animate-fade-in print-expand">
                {/* Score weights chart */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ScoreBreakdownChart breakdown={score_breakdown} />
                  <ScoreBreakdownTable breakdown={score_breakdown} totalScore={credit_score} />
                </div>
                
                {/* Ratios vs benchmarks chart */}
                <RatioDashboardChart financials={financials} />
              </div>
            )}

            {/* RISK TAB */}
            {activeTab === 'risk' && (
              <div className="space-y-6 animate-fade-in print-expand">
                {/* Covenant assessment tables */}
                <RatioAnalysisTable financials={financials} />

                {/* Side-by-side Lists */}
                <StrengthsRisksPanel strengths={decision.strengths} risks={decision.risks} />

                {/* Conditions / Monitoring lists */}
                <MonitoringList 
                  monitoringRequirements={decision.monitoring_requirements} 
                  conditions={decision.conditions}
                  recommendation={decision.recommendation}
                />
              </div>
            )}

            {/* CHAT TAB */}
            {activeTab === 'chat' && (
              <div className="h-[calc(100vh-220px)] border border-slate-800 rounded-2xl p-5 bg-slate-900/20 overflow-hidden flex flex-col print-expand">
                <ChatPage embedMode={true} />
              </div>
            )}

          </div>

          {/* Right sidebar valuation column (only if ticker is resolved) */}
          <div className="lg:col-span-1 space-y-6 h-full sticky top-[96px] no-print">
            <StockPanel ticker={ticker} />
          </div>

        </div>

        {/* Sticky compilation bar */}
        <ReportDownloadBar sessionId={sessionId!} companyName={financials.company_name} />
      </div>
    </Layout>
  )
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  )
}
