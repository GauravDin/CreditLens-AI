// src/components/charts/PriceSparkline.tsx
import React from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { StockHistory } from '../../types/api'

interface PriceSparklineProps {
  history: StockHistory[]
  currency: string
}

export function PriceSparkline({ history, currency }: PriceSparklineProps) {
  if (!history || history.length === 0) {
    return (
      <div className="h-24 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center justify-center text-[10px] text-slate-500 italic">
        No stock price history available.
      </div>
    )
  }

  // Map dataset
  const data = history.map(item => ({
    date: item.date,
    price: item.close
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload
      return (
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 shadow-xl text-[10px]">
          <p className="text-slate-500 font-semibold">{dataPoint.date}</p>
          <p className="font-black text-slate-200 mt-0.5">
            {currency} {dataPoint.price.toFixed(2)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-28 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <defs>
            <linearGradient id="sparklineGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" hide />
          <YAxis domain={['auto', 'auto']} hide />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#3b82f6"
            strokeWidth={1.5}
            fillOpacity={1}
            fill="url(#sparklineGlow)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
