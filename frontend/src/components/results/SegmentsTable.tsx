// src/components/results/SegmentsTable.tsx
import React from 'react'
import { SegmentData } from '../../types/api'
import { PieChart, ListCollapse } from 'lucide-react'
import { formatRawNumber, formatPercent } from '../../utils/formatters'

interface SegmentsTableProps {
  segments: SegmentData[]
  currency: string
  unit: string
}

export function SegmentsTable({ segments, currency, unit }: SegmentsTableProps) {
  if (!segments || segments.length === 0) {
    return null
  }

  // Helper to resolve margin dynamically
  const resolveMargin = (seg: SegmentData) => {
    if (seg.margin !== null && seg.margin !== undefined) return seg.margin
    if (seg.revenue && seg.profit) {
      return (seg.profit / seg.revenue) * 100
    }
    return null
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mt-6">
      {/* Header */}
      <div className="flex items-center gap-2.5 p-5 border-b border-slate-850 bg-slate-900">
        <PieChart className="w-5 h-5 text-blue-500" />
        <div>
          <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider">Business Segment Breakdown</h3>
          <span className="text-[10px] text-slate-500 font-semibold">Values in ({currency} {unit})</span>
        </div>
      </div>

      {/* Table grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950/40 text-slate-400 border-b border-slate-850 uppercase font-black tracking-wider text-[10px]">
              <th className="py-3.5 px-5">Segment Name</th>
              <th className="py-3.5 px-5 text-right">Revenue</th>
              <th className="py-3.5 px-5 text-right">Profit / Contribution</th>
              <th className="py-3.5 px-5 text-right">Operating Margin (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {segments.map((seg, idx) => {
              const margin = resolveMargin(seg)
              return (
                <tr key={idx} className="hover:bg-slate-850/20 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-slate-200">{seg.name}</td>
                  <td className="py-3.5 px-5 text-right font-black font-display">{formatRawNumber(seg.revenue, 1)}</td>
                  <td className="py-3.5 px-5 text-right font-black font-display">{formatRawNumber(seg.profit, 1)}</td>
                  <td className="py-3.5 px-5 text-right font-black font-display text-emerald-400">
                    {formatPercent(margin, 1)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
