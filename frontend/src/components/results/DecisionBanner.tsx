// src/components/results/DecisionBanner.tsx
import React, { useState } from 'react'
import { StatusBadge } from '../common/StatusBadge'
import { LendingDecision } from '../../types/api'
import { ShieldCheck, Copy, Check } from 'lucide-react'

interface DecisionBannerProps {
  decision: LendingDecision
  companyName: string
  currency: string
  unit: string
}

export function DecisionBanner({ decision, companyName, currency, unit }: DecisionBannerProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(decision.narrative)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getTheme = (rec: string) => {
    switch (rec) {
      case 'APPROVE':
        return 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
      case 'CONDITIONAL':
        return 'border-amber-500/20 bg-amber-500/5 text-amber-400'
      case 'DECLINE':
        return 'border-red-500/20 bg-red-500/5 text-red-400'
      default:
        return 'border-slate-800 bg-slate-900/40 text-slate-400'
    }
  }

  const formatCurrency = (val: number | null) => {
    if (val === null) return '–'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.length === 3 ? currency : 'USD',
      maximumFractionDigits: 0
    }).format(val)
  }

  return (
    <div className={`border rounded-2xl p-6 relative overflow-hidden ${getTheme(decision.recommendation)}`}>
      {/* Background graphic */}
      <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-x-12 translate-y-12">
        <ShieldCheck className="w-64 h-64" />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-2">
            AI Lending Decision
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-black font-display text-slate-100">
              {companyName}
            </h2>
            <StatusBadge status={decision.recommendation} />
          </div>
          <p className="text-sm text-slate-300 mt-3 max-w-3xl leading-relaxed">
            {decision.narrative}
          </p>
        </div>

        {/* Max Safe Loan Indicator */}
        {decision.max_safe_loan !== null && (
          <div className="flex-shrink-0 bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 min-w-[200px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Max Safe Loan Cap
            </span>
            <div className="text-xl font-black text-slate-100">
              {formatCurrency(decision.max_safe_loan)}
            </div>
            <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">
              In {currency} {unit}
            </span>
          </div>
        )}
      </div>

      {/* Action panel */}
      <div className="mt-4 pt-4 border-t border-slate-800/60 flex justify-between items-center text-xs">
        <span className="text-slate-500 font-semibold">
          Loan-to-Asset Ratio: <strong className="text-slate-300">{decision.loan_to_asset_ratio !== null ? `${decision.loan_to_asset_ratio}%` : 'N/A'}</strong>
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-400 hover:text-slate-200 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Copied Summary</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Narrative</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
