// src/hooks/useStock.ts
import { useApp } from '../context/AppContext'
import { api } from '../api/client'
import toast from 'react-hot-toast'

export function useStock() {
  const { state, dispatch } = useApp()

  const fetchStock = async (ticker: string) => {
    if (!ticker.trim()) return

    dispatch({ type: 'SET_STOCK_LOADING', payload: true })
    
    try {
      const res = await api.stock(ticker)
      const data = res.data
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      dispatch({ type: 'SET_STOCK_DATA', payload: data })
    } catch (err: any) {
      console.error(err)
      dispatch({ type: 'SET_STOCK_DATA', payload: null })
      // Suppress annoying stock toast if yfinance limits are hit, but log it
      console.warn(`Could not load stock data for ${ticker}: ${err.message}`)
    } finally {
      dispatch({ type: 'SET_STOCK_LOADING', payload: false })
    }
  }

  return {
    stockData: state.stockData,
    stockLoading: state.stockLoading,
    fetchStock,
  }
}
