// src/components/results/CashFlowTable.tsx
import React, { useState } from 'react'
import { FinancialData } from '../../types/api'
import { ChevronDown, ChevronUp, FileSpreadsheet } from 'lucide-react'
import { formatRawNumber } from '../../utils/formatters'

interface CashFlowTableProps {
  financials: FinancialData
}

export function CashFlowTable({ financials }: CashFlowTableProps) {
  const [isOpen, setIsOpen] = useState(true)
  const { currency, unit } = financials

  const rows = [
    { label: 'Operating Cash Flow', key: 'operating_cash_flow', desc: 'Cash generated from core commercial operations.' },
    { label: 'Capital Expenditure (CapEx)', key: 'capex', desc: 'Funds used to acquire or upgrade physical fixed assets.' },
    { label: 'Free Cash Flow', key: 'free_cash_flow', desc: 'Cash generated after subtraction of capital expenditures.' },
  ]

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mt-6">
      {/* Header section with toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-slate-900 hover:bg-slate-850/50 transition-colors text-left border-none"
      >
        <div className="flex items-center gap-2.5">
          <FileSpreadsheet className="w-5 h-5 text-blue-500" />
          <div>
            <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider">Cash Flow Statement</h3>
            <span className="text-[10px] text-slate-500 font-semibold">Values in ({currency} {unit})</span>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>

      {/* Table rows */}
      {isOpen && (
        <div className="border-t border-slate-800/80 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/40 text-slate-400 border-b border-slate-800/60 uppercase font-black tracking-wider text-[10px]">
                <th className="py-3.5 px-5 w-1/3">Line Item</th>
                <th className="py-3.5 px-5 w-1/2 hidden sm:table-cell">Description</th>
                <th className="py-3.5 px-5 text-right w-1/6">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {rows.map((row) => {
                const val = (financials as any)[row.key]
                const isNull = val === null || val === undefined

                return (
                  <tr key={row.key} className="hover:bg-slate-850/20 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-200">{row.label}</td>
                    <td className="py-3.5 px-5 text-slate-400 hidden sm:table-cell">{row.desc}</td>
                    <td className={`py-3.5 px-5 text-right font-black font-display text-sm ${
                      isNull ? 'text-slate-600' : 'text-slate-100'
                    }`}>
                      {formatRawNumber(val, 2)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
