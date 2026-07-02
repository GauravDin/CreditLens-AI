// src/components/results/RatioAnalysisTable.tsx
import React from 'react'
import { FinancialData } from '../../types/api'
import { ShieldCheck, Scale } from 'lucide-react'
import { formatPercent, formatRatio } from '../../utils/formatters'

interface RatioAnalysisTableProps {
  financials: FinancialData
}

export function RatioAnalysisTable({ financials }: RatioAnalysisTableProps) {
  const {
    current_ratio,
    quick_ratio,
    equity_ratio,
    debt_to_equity,
    roe,
    roa,
    operating_margin,
    interest_coverage,
    dscr
  } = financials

  // Evaluation helpers
  const getAssessment = (name: string, val: number | null) => {
    if (val === null || val === undefined) return { label: '–', color: 'text-slate-500' }
    
    switch (name) {
      case 'Current Ratio':
        return val >= 2.0 
          ? { label: 'Strong', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' }
          : { label: 'Weak', color: 'bg-red-500/10 text-red-400 border border-red-500/20' }
      case 'Quick Ratio':
        return val >= 1.0 
          ? { label: 'Strong', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' }
          : { label: 'Weak', color: 'bg-red-500/10 text-red-400 border border-red-500/20' }
      case 'Equity Ratio':
        if (val >= 60) return { label: 'Strong', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' }
        if (val >= 40) return { label: 'OK', color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' }
        return { label: 'Weak', color: 'bg-red-500/10 text-red-400 border border-red-500/20' }
      case 'Debt / Equity':
        if (val <= 1.0) return { label: 'Low Debt', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' }
        if (val <= 2.0) return { label: 'Moderate', color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' }
        return { label: 'High Debt', color: 'bg-red-500/10 text-red-400 border border-red-500/20' }
      case 'ROE':
        return val >= 15 
          ? { label: 'Strong', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' }
          : { label: 'Weak', color: 'bg-red-500/10 text-red-400 border border-red-500/20' }
      case 'ROA':
        return val >= 10 
          ? { label: 'Strong', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' }
          : { label: 'Weak', color: 'bg-red-500/10 text-red-400 border border-red-500/20' }
      case 'Operating Margin':
        return val >= 20 
          ? { label: 'Strong', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' }
          : { label: 'Weak', color: 'bg-red-500/10 text-red-400 border border-red-500/20' }
      case 'Interest Coverage':
        return val >= 5 
          ? { label: 'Strong', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' }
          : { label: 'Weak', color: 'bg-red-500/10 text-red-400 border border-red-500/20' }
      case 'DSCR':
        return val >= 2.0 
          ? { label: 'Strong', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' }
          : { label: 'Weak', color: 'bg-red-500/10 text-red-400 border border-red-500/20' }
      default:
        return { label: 'Neutral', color: 'bg-slate-800 text-slate-400 border border-slate-700' }
    }
  }

  const ratioList = [
    { cat: 'Liquidity', name: 'Current Ratio', value: formatRatio(current_ratio), benchmark: '≥ 2.00×', key: 'Current Ratio', raw: current_ratio },
    { cat: 'Liquidity', name: 'Quick Ratio', value: formatRatio(quick_ratio), benchmark: '≥ 1.00×', key: 'Quick Ratio', raw: quick_ratio },
    { cat: 'Leverage', name: 'Equity Ratio', value: formatPercent(equity_ratio), benchmark: '≥ 40.0%', key: 'Equity Ratio', raw: equity_ratio },
    { cat: 'Leverage', name: 'Debt / Equity', value: formatRatio(debt_to_equity), benchmark: '≤ 1.50×', key: 'Debt / Equity', raw: debt_to_equity },
    { cat: 'Profitability', name: 'ROE', value: formatPercent(roe), benchmark: '≥ 10.0%', key: 'ROE', raw: roe },
    { cat: 'Profitability', name: 'ROA', value: formatPercent(roa), benchmark: '≥ 5.0%', key: 'ROA', raw: roa },
    { cat: 'Profitability', name: 'Operating Margin', value: formatPercent(operating_margin), benchmark: '≥ 10.0%', key: 'Operating Margin', raw: operating_margin },
    { cat: 'Coverage', name: 'Interest Coverage', value: formatRatio(interest_coverage), benchmark: '≥ 3.00×', key: 'Interest Coverage', raw: interest_coverage },
    { cat: 'Coverage', name: 'DSCR', value: formatRatio(dscr), benchmark: '≥ 1.50×', key: 'DSCR', raw: dscr },
  ]

  // Group ratios by category
  const categories = ['Liquidity', 'Leverage', 'Profitability', 'Coverage']

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mt-6">
      {/* Header */}
      <div className="flex items-center gap-2.5 p-5 border-b border-slate-850 bg-slate-900">
        <Scale className="w-5 h-5 text-blue-500" />
        <div>
          <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider">Financial Ratio Analysis</h3>
          <span className="text-[10px] text-slate-500 font-semibold">Standard benchmark compliance matrix</span>
        </div>
      </div>

      {/* Table grids */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950/40 text-slate-400 border-b border-slate-850 uppercase font-black tracking-wider text-[10px]">
              <th className="py-3.5 px-5">Financial Ratio</th>
              <th className="py-3.5 px-5 text-right">Value</th>
              <th className="py-3.5 px-5 text-right">Benchmark</th>
              <th className="py-3.5 px-5 text-center">Assessment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {categories.map((cat) => {
              const items = ratioList.filter((r) => r.cat === cat)
              return (
                <React.Fragment key={cat}>
                  {/* Category Section Row */}
                  <tr className="bg-slate-850/40">
                    <td colSpan={4} className="py-2.5 px-5 font-black text-slate-400 text-[10px] uppercase tracking-wider">
                      {cat} Analysis
                    </td>
                  </tr>
                  {items.map((item) => {
                    const status = getAssessment(item.key, item.raw)
                    return (
                      <tr key={item.name} className="hover:bg-slate-850/20 transition-colors">
                        <td className="py-3.5 px-5 text-slate-200 font-semibold">{item.name}</td>
                        <td className="py-3.5 px-5 text-right font-black font-display text-sm">{item.value}</td>
                        <td className="py-3.5 px-5 text-right text-slate-400 font-bold">{item.benchmark}</td>
                        <td className="py-3.5 px-5 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
