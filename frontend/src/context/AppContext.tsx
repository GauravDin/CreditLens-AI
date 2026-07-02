import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { UploadedFile, CreditAnalysisResult, ChatMessage, StockData } from '../types/api'
import { appReducer, AppAction } from './appReducer'

export interface AppState {
  sessionId: string | null
  uploadedFiles: UploadedFile[]
  uploadStatus: 'idle' | 'uploading' | 'done' | 'error'
  analysisStatus: 'idle' | 'running' | 'done' | 'error'
  analysis: CreditAnalysisResult | null
  loanAmount: number | null
  loanCurrency: string | null
  chatMessages: ChatMessage[]
  chatLoading: boolean
  stockData: StockData | null
  stockLoading: boolean
  activeTab: 'overview' | 'financials' | 'scoring' | 'risk' | 'chat'
  error: string | null
}

const getInitialState = (): AppState => {
  try {
    const cached = localStorage.getItem('credit_ai_session')
    if (cached) {
      const parsed = JSON.parse(cached)
      if (parsed && parsed.sessionId) {
        return {
          sessionId: parsed.sessionId,
          uploadedFiles: [],
          uploadStatus: 'done',
          analysisStatus: parsed.analysis ? 'done' : 'idle',
          analysis: parsed.analysis || null,
          loanAmount: parsed.analysis?.loan_amount_requested || null,
          loanCurrency: parsed.analysis?.financials?.currency || null,
          chatMessages: [],
          chatLoading: false,
          stockData: null,
          stockLoading: false,
          activeTab: 'overview',
          error: null,
        }
      }
    }
  } catch (err) {
    console.error('Failed to load session from cache', err)
  }

  return {
    sessionId: null,
    uploadedFiles: [],
    uploadStatus: 'idle',
    analysisStatus: 'idle',
    analysis: null,
    loanAmount: null,
    loanCurrency: null,
    chatMessages: [],
    chatLoading: false,
    stockData: null,
    stockLoading: false,
    activeTab: 'overview',
    error: null,
  }
}

interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, null, getInitialState)

  // Sync to localStorage
  useEffect(() => {
    if (state.sessionId) {
      localStorage.setItem(
        'credit_ai_session',
        JSON.stringify({
          sessionId: state.sessionId,
          analysis: state.analysis,
        })
      )
    } else {
      localStorage.removeItem('credit_ai_session')
    }
  }, [state.sessionId, state.analysis])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
