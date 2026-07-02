// src/components/charts/ScoreBreakdownChart.tsx
import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import { ScoreBreakdown } from '../../types/api'

interface ScoreBreakdownChartProps {
  breakdown: ScoreBreakdown
}

export function ScoreBreakdownChart({ breakdown }: ScoreBreakdownChartProps) {
  const data = [
    { name: 'Profitability', score: breakdown.profitability, max: 30, color: '#1E4D8C' },
    { name: 'Leverage', score: breakdown.leverage, max: 25, color: '#4A90D9' },
    { name: 'Liquidity', score: breakdown.liquidity, max: 20, color: '#27AE60' },
    { name: 'Growth', score: breakdown.growth, max: 15, color: '#E67E22' },
    { name: 'Qualitative', score: breakdown.qualitative, max: 10, color: '#7F8C8D' },
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload
      return (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 shadow-xl text-xs">
          <p className="font-bold text-slate-200 mb-1">{dataPoint.name}</p>
          <div className="flex items-center gap-1">
            <span className="text-slate-400">Score:</span>
            <span className="font-black text-slate-100">{dataPoint.score}</span>
            <span className="text-slate-500">/ {dataPoint.max}</span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider mb-4">
        Credit Score Category Breakdown
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis 
              type="number" 
              domain={[0, 30]} 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="score" 
              radius={[0, 4, 4, 0]} 
              barSize={20}
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
