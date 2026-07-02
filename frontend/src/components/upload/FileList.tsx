// src/components/upload/FileList.tsx
import React from 'react'
import { Trash2, AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react'
import { FileTypeIcon } from '../common/FileTypeIcon'
import { UploadedFile } from '../../types/api'

interface FileListProps {
  files: UploadedFile[]
  onRemove: (idx: number) => void
  disabled?: boolean
}

export function FileList({ files, onRemove, disabled = false }: FileListProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  if (files.length === 0) return null

  return (
    <div className="space-y-3 mt-6">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
        Selected Documents ({files.length})
      </h3>
      {files.map((file, idx) => (
        <div 
          key={idx} 
          className={`flex items-center justify-between p-4 bg-slate-900 border rounded-xl hover:border-slate-700 transition-colors ${
            file.status === 'failed' ? 'border-red-500/30 bg-red-500/5' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <FileTypeIcon filename={file.name} className="w-10 h-10 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-slate-200 truncate" title={file.name}>
                {file.name}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500">{formatBytes(file.size)}</span>
                
                {/* File Status Icons */}
                {file.status === 'pending' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    <Clock className="w-3 h-3" /> Ready
                  </span>
                )}
                {file.status === 'uploading' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-blue-400">
                    <Loader2 className="w-3 h-3 animate-spin" /> Uploading
                  </span>
                )}
                {file.status === 'completed' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                    <CheckCircle className="w-3 h-3" /> Extracted
                  </span>
                )}
                {file.status === 'failed' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-red-400">
                    <AlertCircle className="w-3 h-3" /> Error
                  </span>
                )}
              </div>
              {file.error && (
                <div className="text-[10px] text-red-400 mt-1 font-semibold leading-relaxed">
                  {file.error}
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={() => onRemove(idx)}
            disabled={disabled}
            className="w-9 h-9 rounded-lg border border-slate-800 hover:border-red-500/30 hover:bg-red-500/5 text-slate-400 hover:text-red-400 flex items-center justify-center transition-colors disabled:opacity-40 disabled:pointer-events-none"
            aria-label="Remove File"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
