// src/components/stock/StockPanel.tsx
import React, { useEffect } from 'react'
import { useStock } from '../../hooks/useStock'
import { PriceSparkline } from '../charts/PriceSparkline'
import { TrendingUp, Landmark, BarChart3, Info } from 'lucide-react'
import { formatRawNumber, formatPercent } from '../../utils/formatters'
import { SkeletonCard } from '../common/LoadingSkeleton'

interface StockPanelProps {
  ticker: string | null
}

export function StockPanel({ ticker }: StockPanelProps) {
  const { stockData, stockLoading, fetchStock } = useStock()

  useEffect(() => {
    if (ticker) {
      fetchStock(ticker)
    }
  }, [ticker])

  if (!ticker) return null

  if (stockLoading) {
    return <SkeletonCard className="mt-6" />
  }

  if (!stockData) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-2.5 text-slate-500 text-xs py-6 mt-6">
        <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <span>Market ticker resolved ({ticker}) but stock data is currently unavailable.</span>
      </div>
    )
  }

  const {
    current_price,
    previous_close,
    market_cap,
    pe_ratio,
    pb_ratio,
    beta,
    eps,
    roe,
    currency,
    exchange,
    history
  } = stockData

  // Calculate price daily change percentage
  const getPriceChange = () => {
    if (current_price === null || previous_close === null) return null
    const diff = current_price - previous_close
    const pct = (diff / previous_close) * 100
    return {
      diff,
      pct,
      isPositive: diff >= 0
    }
  }

  const change = getPriceChange()

  const formatMarketCap = (val: number | null) => {
    if (val === null) return '–'
    if (val >= 1e12) return `${(val / 1e12).toFixed(2)}T`
    if (val >= 1e9) return `${(val / 1e9).toFixed(2)}B`
    if (val >= 1e6) return `${(val / 1e6).toFixed(2)}M`
    return val.toLocaleString()
  }

  const items = [
    { label: 'Market Cap', value: formatMarketCap(market_cap) },
    { label: 'P/E Ratio', value: pe_ratio !== null ? `${pe_ratio.toFixed(1)}x` : '–' },
    { label: 'P/B Ratio', value: pb_ratio !== null ? `${pb_ratio.toFixed(2)}x` : '–' },
    { label: 'Beta (Volatility)', value: beta !== null ? beta.toFixed(2) : '–' },
    { label: 'EPS', value: eps !== null ? `${eps.toFixed(2)}` : '–' },
    { label: 'ROE', value: formatPercent(roe !== null ? roe * 100 : null, 1) },
  ]

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mt-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <div>
            <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider">Stock Valuation</h3>
            <span className="text-[10px] text-slate-500 font-semibold">{exchange || 'Exchange'} ticker info</span>
          </div>
        </div>
        <span className="text-xs font-black text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700 select-all uppercase">
          {ticker}
        </span>
      </div>

      {/* Pricing Header */}
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Live Valuation</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black font-display text-slate-100">
              {current_price !== null ? current_price.toLocaleString() : '–'}
            </span>
            <span className="text-xs text-slate-400 font-bold">{currency}</span>
          </div>
        </div>

        {change && (
          <div className={`text-right ${change.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            <span className="text-sm font-black">
              {change.isPositive ? '+' : ''}{change.diff.toFixed(2)}
            </span>
            <span className="text-xs block font-bold">
              ({change.isPositive ? '+' : ''}{change.pct.toFixed(2)}%)
            </span>
          </div>
        )}
      </div>

      {/* Sparkline Graph */}
      <div className="mb-5 bg-slate-950/20 border border-slate-850 rounded-xl p-3">
        <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">
          252-Day Close Price Sparkline
        </span>
        <PriceSparkline history={history} currency={currency} />
      </div>

      {/* Fundamentals grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {items.map((item) => (
          <div 
            key={item.label}
            className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl flex flex-col justify-between"
          >
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">
              {item.label}
            </span>
            <span className="text-sm font-black text-slate-200 font-display">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
