// src/components/charts/RatioDashboardChart.tsx
import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine, ResponsiveContainer } from 'recharts'
import { FinancialData } from '../../types/api'

interface RatioDashboardChartProps {
  financials: FinancialData
}

export function RatioDashboardChart({ financials }: RatioDashboardChartProps) {
  const rows = [
    { label: 'Current Ratio', val: financials.current_ratio, b: 2.0, u: '×' },
    { label: 'Quick Ratio', val: financials.quick_ratio, b: 1.0, u: '×' },
    { label: 'Equity Ratio', val: financials.equity_ratio, b: 40.0, u: '%' },
    { label: 'ROE', val: financials.roe, b: 10.0, u: '%' },
    { label: 'Operating Margin', val: financials.operating_margin, b: 10.0, u: '%' },
    { label: 'Interest Coverage', val: financials.interest_coverage, b: 3.0, u: '×' },
    { label: 'DSCR', val: financials.dscr, b: 1.5, u: '×' },
  ]

  const data = rows
    .filter(r => r.val !== null && r.val !== undefined)
    .map(r => {
      const val = r.val as number
      const pct = (val / r.b) * 100
      const color = pct >= 100 ? '#10b981' : pct >= 70 ? '#f59e0b' : '#ef4444'
      return {
        name: r.label,
        value: val,
        benchmark: r.b,
        unit: r.u,
        percent: Math.min(pct, 200), // Cap at 200% for display readability
        rawPercent: pct,
        color
      }
    })

  if (data.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-center text-slate-500 text-xs py-8">
        No ratio metrics available to render chart.
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload
      return (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 shadow-xl text-xs">
          <p className="font-bold text-slate-200 mb-1.5">{dataPoint.name}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Value:</span>
              <span className="font-black text-slate-100">{dataPoint.value.toFixed(2)}{dataPoint.unit}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Benchmark:</span>
              <span className="font-bold text-slate-300">≥ {dataPoint.benchmark}{dataPoint.unit}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Benchmark %:</span>
              <span className="font-black" style={{ color: dataPoint.color }}>
                {dataPoint.rawPercent.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mt-6">
      <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider mb-4">
        Key Ratios vs Benchmarks (% of Target)
      </h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis 
              type="number" 
              domain={[0, 200]} 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={100} stroke="#475569" strokeWidth={1.5} strokeDasharray="4 4" />
            <Bar 
              dataKey="percent" 
              radius={[0, 4, 4, 0]} 
              barSize={16}
              background={{ fill: '#1e293b', radius: 4 }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
