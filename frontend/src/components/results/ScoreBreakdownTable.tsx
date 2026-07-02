// src/components/results/ScoreBreakdownTable.tsx
import React from 'react'
import { ScoreBreakdown } from '../../types/api'
import { CheckSquare } from 'lucide-react'
import { formatRawNumber, formatPercent } from '../../utils/formatters'

interface ScoreBreakdownTableProps {
  breakdown: ScoreBreakdown
  totalScore: number
}

export function ScoreBreakdownTable({ breakdown, totalScore }: ScoreBreakdownTableProps) {
  const maxes: Record<string, number> = {
    profitability: 30,
    leverage: 25,
    liquidity: 20,
    growth: 15,
    qualitative: 10,
  }

  const descriptions: Record<string, string> = {
    profitability: 'Assesses ROE (12), Operating Margin (10), and ROA (8) performance indicators.',
    leverage: 'Evaluates Equity Ratio (15) and Debt-to-Equity (10) benchmarks.',
    liquidity: 'Measures Current Ratio (10) and DSCR or Interest Coverage (10) metrics.',
    growth: 'Compares YoY Revenue Growth (7.5) and Net Profit Growth (7.5) ratios.',
    qualitative: 'AI qualitative assessment of business quality, management team, and industry outlook.',
  }

  const rows = Object.keys(maxes).map((key) => {
    const score = (breakdown as any)[key] || 0
    const max = maxes[key]
    const percent = max > 0 ? (score / max) * 100 : 0
    return {
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      score,
      max,
      percent,
      desc: descriptions[key],
    }
  })

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 p-5 border-b border-slate-850 bg-slate-900">
        <CheckSquare className="w-5 h-5 text-blue-500" />
        <div>
          <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider">Score Breakdown Matrix</h3>
          <span className="text-[10px] text-slate-500 font-semibold">Weighted performance bands totaling 100</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950/40 text-slate-400 border-b border-slate-850 uppercase font-black tracking-wider text-[10px]">
              <th className="py-3.5 px-5">Weighted Category</th>
              <th className="py-3.5 px-5 hidden sm:table-cell">Scoring Rules</th>
              <th className="py-3.5 px-5 text-right">Score</th>
              <th className="py-3.5 px-5 text-right">Max Weight</th>
              <th className="py-3.5 px-5 text-right">Compliance %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {rows.map((row) => (
              <tr key={row.key} className="hover:bg-slate-850/20 transition-colors">
                <td className="py-3.5 px-5 font-bold text-slate-200">{row.label}</td>
                <td className="py-3.5 px-5 text-slate-400 hidden sm:table-cell">{row.desc}</td>
                <td className="py-3.5 px-5 text-right font-black font-display text-sm text-blue-400">
                  {formatRawNumber(row.score, 1)}
                </td>
                <td className="py-3.5 px-5 text-right font-bold text-slate-400">{row.max}</td>
                <td className="py-3.5 px-5 text-right font-black font-display text-emerald-400">
                  {formatPercent(row.percent, 1)}
                </td>
              </tr>
            ))}
            {/* Total Row */}
            <tr className="bg-slate-950/60 font-bold border-t-2 border-slate-800">
              <td className="py-4 px-5 text-slate-200 text-sm font-black">TOTAL SCORE</td>
              <td className="py-4 px-5 hidden sm:table-cell" />
              <td className="py-4 px-5 text-right text-blue-500 text-base font-black">
                {formatRawNumber(totalScore, 1)}
              </td>
              <td className="py-4 px-5 text-right text-slate-200 text-sm font-black">100</td>
              <td className="py-4 px-5 text-right text-emerald-400 text-sm font-black">
                {formatPercent(totalScore, 1)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
