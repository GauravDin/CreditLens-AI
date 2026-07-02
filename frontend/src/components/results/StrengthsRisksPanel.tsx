// src/components/results/StrengthsRisksPanel.tsx
import React from 'react'
import { CheckCircle2, AlertOctagon } from 'lucide-react'

interface StrengthsRisksPanelProps {
  strengths: string[]
  risks: string[]
}

export function StrengthsRisksPanel({ strengths, risks }: StrengthsRisksPanelProps) {
  const safeStrengths = strengths && strengths.length > 0 ? strengths : ['No outstanding credit strengths flagged.']
  const safeRisks = risks && risks.length > 0 ? risks : ['No critical risk factors flagged.']

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {/* Strengths Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Primary Strengths
        </h3>
        <ul className="space-y-3">
          {safeStrengths.map((str, idx) => (
            <li 
              key={idx} 
              className={`flex items-start gap-2.5 text-xs leading-relaxed ${
                strengths && strengths.length > 0 ? 'text-slate-300' : 'text-slate-500 italic'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
              <span>{str}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Risks Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-red-400" />
          Risk Factors & Exposures
        </h3>
        <ul className="space-y-3">
          {safeRisks.map((risk, idx) => (
            <li 
              key={idx} 
              className={`flex items-start gap-2.5 text-xs leading-relaxed ${
                risks && risks.length > 0 ? 'text-slate-300' : 'text-slate-500 italic'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
              <span>{risk}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
