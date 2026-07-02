// src/components/upload/UploadProgress.tsx
import React, { useEffect, useState } from 'react'
import { AgentAvatar } from '../common/AgentAvatar'
import { Loader2, CheckCircle, Search, Cpu, Database, Network } from 'lucide-react'

interface UploadProgressProps {
  status: 'idle' | 'uploading' | 'done' | 'error'
  filesCount: number
}

export function UploadProgress({ status, filesCount }: UploadProgressProps) {
  const [activeStep, setActiveStep] = useState(0)

  // Simulation of background micro-steps in the RAG/Azure extraction process
  const steps = [
    { label: 'Uploading files to temporary secure workspace...', icon: <Database className="w-4 h-4" /> },
    { label: 'Running Azure AI Document Intelligence OCR...', icon: <Cpu className="w-4 h-4" /> },
    { label: 'Parsing hierarchical Markdown elements & text...', icon: <Search className="w-4 h-4" /> },
    { label: 'Building local vector index structures for Q&A...', icon: <Network className="w-4 h-4" /> }
  ]

  useEffect(() => {
    if (status === 'uploading') {
      setActiveStep(0)
      const t1 = setTimeout(() => setActiveStep(1), 1500)
      const t2 = setTimeout(() => setActiveStep(2), 3500)
      const t3 = setTimeout(() => setActiveStep(3), 5500)
      
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)
      }
    } else if (status === 'done') {
      setActiveStep(4)
    }
  }, [status])

  if (status !== 'uploading' && status !== 'done') return null

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-6 max-w-4xl mx-auto shadow-xl">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Animated Agent Face with thinking purple eyes */}
        <AgentAvatar size="lg" isAnalyzing={status === 'uploading'} className="flex-shrink-0" />
        
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-slate-200">
              {status === 'uploading' ? 'Agent is Extracting Data' : 'Data Ready for Analysis'}
            </h4>
            <span className="text-xs text-blue-400 font-bold">
              {status === 'uploading' ? 'Processing...' : 'Ready'}
            </span>
          </div>

          {/* Main Progress Bar */}
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden relative mb-4">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${(activeStep / 4) * 100}%` }}
            />
            {status === 'uploading' && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            )}
          </div>

          {/* Micro-steps status indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {steps.map((step, idx) => {
              const isCompleted = activeStep > idx
              const isActive = activeStep === idx

              return (
                <div 
                  key={idx} 
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs transition-all ${
                    isCompleted 
                      ? 'border-emerald-500/20 bg-emerald-500/5 text-slate-300' 
                      : isActive 
                        ? 'border-blue-500/30 bg-blue-500/5 text-blue-400 font-bold' 
                        : 'border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : isActive ? (
                      <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                    ) : (
                      <span className="text-slate-600">{step.icon}</span>
                    )}
                  </div>
                  <span className="truncate">{step.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
