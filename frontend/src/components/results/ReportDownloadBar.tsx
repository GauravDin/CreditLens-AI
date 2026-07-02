// src/components/results/ReportDownloadBar.tsx
import React, { useState } from 'react'
import { api } from '../../api/client'
import toast from 'react-hot-toast'
import { FileText, FileCode, Loader2, Download } from 'lucide-react'

interface ReportDownloadBarProps {
  sessionId: string
  companyName: string
}

export function ReportDownloadBar({ sessionId, companyName }: ReportDownloadBarProps) {
  const [downloadingDocx, setDownloadingDocx] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  const download = async (fmt: 'docx' | 'pdf') => {
    const setLoader = fmt === 'docx' ? setDownloadingDocx : setDownloadingPdf
    setLoader(true)
    const toastId = toast.loading(`Generating & compiling ${fmt.toUpperCase()} proposal...`)

    try {
      const res = await api.downloadReport(sessionId, fmt)
      
      // Build blob download link
      const blob = new Blob([res.data], {
        type: fmt === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      })
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const safeName = companyName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
      a.download = `${safeName}_credit_${today}.${fmt}`
      
      document.body.appendChild(a)
      a.click()
      
      // Clean up DOM and memory
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success(`${fmt.toUpperCase()} credit report downloaded successfully!`, { id: toastId })
    } catch (err: any) {
      console.error(err)
      toast.error('Report generation failed — analysis may be incomplete', { id: toastId })
    } finally {
      setLoader(false)
    }
  }

  return (
    <div className="no-print fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 z-40 flex items-center justify-between px-6 shadow-2xl">
      <div className="hidden sm:block">
        <span className="text-xs text-slate-400 font-semibold">Proposal Compilation Panel</span>
        <p className="text-[10px] text-slate-500">Select format to export the compiled AI analysis metrics.</p>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* Word Export */}
        <button
          onClick={() => download('docx')}
          disabled={downloadingDocx || downloadingPdf}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-slate-200 transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          {downloadingDocx ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span>Generating Word...</span>
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Download Word Report</span>
            </>
          )}
        </button>

        {/* PDF Export */}
        <button
          onClick={() => download('pdf')}
          disabled={downloadingDocx || downloadingPdf}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold bg-blue-600 border border-blue-500 hover:bg-blue-500 text-white transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          {downloadingPdf ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating PDF...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download PDF Proposal</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
