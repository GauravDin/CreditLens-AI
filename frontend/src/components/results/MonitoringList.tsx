// src/components/results/MonitoringList.tsx
import React from 'react'
import { Eye, ShieldAlert } from 'lucide-react'

interface MonitoringListProps {
  monitoringRequirements: string[]
  conditions: string[]
  recommendation: 'APPROVE' | 'CONDITIONAL' | 'DECLINE' | string
}

export function MonitoringList({
  monitoringRequirements,
  conditions,
  recommendation
}: MonitoringListProps) {
  const showConditions = recommendation === 'CONDITIONAL' || (conditions && conditions.length > 0)
  const safeConditions = conditions && conditions.length > 0 ? conditions : ['No custom approval covenants defined.']
  const safeMonitoring = monitoringRequirements && monitoringRequirements.length > 0 ? monitoringRequirements : ['Standard annual financial statements check.']

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {/* Conditions Card (only if CONDITIONAL or has items) */}
      {showConditions && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            Approval Covenants & Conditions
          </h3>
          <ul className="space-y-3">
            {safeConditions.map((cond, idx) => (
              <li 
                key={idx} 
                className={`flex items-start gap-2.5 text-xs leading-relaxed ${
                  conditions && conditions.length > 0 ? 'text-slate-300' : 'text-slate-500 italic'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                <span>{cond}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Monitoring Card */}
      <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 ${!showConditions ? 'md:col-span-2' : ''}`}>
        <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-500" />
          Ongoing Monitoring Requirements
        </h3>
        <ul className="space-y-3">
          {safeMonitoring.map((req, idx) => (
            <li 
              key={idx} 
              className={`flex items-start gap-2.5 text-xs leading-relaxed ${
                monitoringRequirements && monitoringRequirements.length > 0 ? 'text-slate-300' : 'text-slate-500 italic'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
              <span>{req}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
