// src/hooks/useAnalysis.ts
import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { api } from '../api/client'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export function useAnalysis() {
  const { state, dispatch } = useApp()
  const [elapsedTime, setElapsedTime] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (state.analysisStatus === 'running') {
      setElapsedTime(0)
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [state.analysisStatus])

  const runAnalysis = async (sessionId: string, loanAmount?: number | null, loanCurrency?: string | null) => {
    dispatch({ type: 'SET_ANALYSIS_STATUS', payload: 'running' })
    dispatch({ type: 'SET_ERROR', payload: null })
    dispatch({
      type: 'SET_LOAN_CONFIG',
      payload: { amount: loanAmount ?? null, currency: loanCurrency ?? null },
    })

    toast.loading('Analyzing financials with NVIDIA LLaMA 3.3 70B...', { id: 'analysis' })

    try {
      const res = await api.analyze(sessionId, loanAmount, loanCurrency)
      const data = res.data

      dispatch({ type: 'SET_ANALYSIS', payload: data })
      dispatch({ type: 'SET_ANALYSIS_STATUS', payload: 'done' })
      toast.success('Credit analysis completed successfully!', { id: 'analysis' })
      
      // Navigate to results page
      navigate(`/results/${sessionId}`)
    } catch (err: any) {
      console.error(err)
      const errMessage = err.message || 'Analysis failed — try re-uploading documents'
      dispatch({ type: 'SET_ANALYSIS_STATUS', payload: 'error' })
      dispatch({ type: 'SET_ERROR', payload: errMessage })
      toast.error(`Analysis failed: ${errMessage}`, { id: 'analysis' })
    }
  }

  const resetAnalysis = () => {
    dispatch({ type: 'RESET_STATE' })
    navigate('/')
  }

  return {
    analysisStatus: state.analysisStatus,
    analysis: state.analysis,
    elapsedTime,
    runAnalysis,
    resetAnalysis,
  }
}
