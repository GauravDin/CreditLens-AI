// src/components/results/AltmanZCard.tsx
import React from 'react'
import { AltmanZScore } from '../../types/api'
import { ZoneTag } from '../common/ZoneTag'
import { Landmark } from 'lucide-react'

interface AltmanZCardProps {
  altmanZ: AltmanZScore | null
}

export function AltmanZCard({ altmanZ }: AltmanZCardProps) {
  if (!altmanZ) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-center text-slate-500 text-xs py-8">
        Balance sheet data insufficient to compute Altman Z′-Score.
      </div>
    )
  }

  const { z_score, zone, x1, x2, x3, x4, x5 } = altmanZ

  const xVariables = [
    { name: 'X1', label: 'Working Capital / Total Assets', value: x1 },
    { name: 'X2', label: 'Retained Earnings / Total Assets', value: x2 },
    { name: 'X3', label: 'EBIT / Total Assets', value: x3 },
    { name: 'X4', label: 'Book Equity / Total Liabilities', value: x4 },
    { name: 'X5', label: 'Revenue / Total Assets', value: x5 },
  ]

  const getZoneText = (z: string) => {
    switch (z) {
      case 'Safe':
        return 'The company is in the Safe Zone, showing robust solvency and very low distress risk (Z′ > 2.9).'
      case 'Grey':
        return 'The company lies in the Grey Zone (1.23 to 2.9). Solvent but requires close liquidity monitoring.'
      case 'Distress':
        return 'Distress Zone Alert (Z′ < 1.23). High risk of insolvency; warrants strict credit monitoring.'
      default:
        return ''
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <h3 className="font-bold text-slate-200 flex items-center gap-2 text-sm uppercase tracking-wider">
          <Landmark className="w-4 h-4 text-blue-500" />
          Altman Z′-Score (Private Model)
        </h3>
        <ZoneTag zone={zone} />
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
        <div className="text-center md:border-r md:border-slate-850 md:pr-6 flex-shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Calculated Score</span>
          <div className="text-5xl font-black font-display text-blue-500">
            {z_score.toFixed(2)}
          </div>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          {getZoneText(zone)}
        </p>
      </div>

      <div className="space-y-2.5">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
          Variable Breakdown
        </span>
        {xVariables.map((variable) => (
          <div 
            key={variable.name}
            className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-850 text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="font-black text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded text-[10px]">
                {variable.name}
              </span>
              <span className="text-slate-300 font-semibold">{variable.label}</span>
            </div>
            <span className="font-bold text-slate-100">
              {variable.value !== null ? variable.value.toFixed(4) : '–'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
