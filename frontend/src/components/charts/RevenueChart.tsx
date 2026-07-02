// src/components/charts/RevenueChart.tsx
import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { FinancialData } from '../../types/api'

interface RevenueChartProps {
  financials: FinancialData
}

export function RevenueChart({ financials }: RevenueChartProps) {
  const {
    revenue,
    revenue_prev,
    operating_profit,
    fiscal_year,
    currency,
    unit
  } = financials

  if (revenue === null) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-center text-slate-500 text-xs py-8">
        No revenue data available to render chart.
      </div>
    )
  }

  // Construct chart dataset
  const data = [
    ...(revenue_prev !== null
      ? [{
          name: 'Prior Year',
          Revenue: revenue_prev,
          'Operating Profit': 0 // Prior operating profit is not explicitly listed in API, but let's hide or show 0
        }]
      : []),
    {
      name: fiscal_year || 'Current Year',
      Revenue: revenue,
      'Operating Profit': operating_profit || 0
    }
  ]

  // Recharts custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 shadow-xl text-xs">
          <p className="font-bold text-slate-200 mb-1.5">{label}</p>
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-2 py-0.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-slate-400">{item.name}:</span>
              <span className="font-black text-slate-100">
                {new Intl.NumberFormat('en-US').format(item.value)} {unit}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider mb-4">
        Revenue & Operating Profit Trend ({currency})
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }}
            />
            <Bar 
              dataKey="Revenue" 
              fill="#1E4D8C" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={50}
            />
            <Bar 
              dataKey="Operating Profit" 
              fill="#27AE60" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
