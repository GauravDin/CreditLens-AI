// src/components/common/FileTypeIcon.tsx
import React from 'react'
import { FileText, FileSpreadsheet, FileImage, FileBarChart, File } from 'lucide-react'

interface FileTypeIconProps {
  filename: string
  className?: string
}

export function FileTypeIcon({ filename, className = '' }: FileTypeIconProps) {
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase()

  const getIcon = (e: string) => {
    switch (e) {
      case '.pdf':
        return {
          icon: <FileText className="w-5 h-5" />,
          color: 'bg-red-500/10 text-red-400 border-red-500/20'
        }
      case '.docx':
      case '.doc':
        return {
          icon: <FileText className="w-5 h-5" />,
          color: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        }
      case '.xlsx':
      case '.xls':
        return {
          icon: <FileSpreadsheet className="w-5 h-5" />,
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        }
      case '.pptx':
      case '.ppt':
        return {
          icon: <FileBarChart className="w-5 h-5" />,
          color: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
        }
      case '.png':
      case '.jpg':
      case '.jpeg':
      case '.tiff':
      case '.bmp':
        return {
          icon: <FileImage className="w-5 h-5" />,
          color: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
        }
      default:
        return {
          icon: <File className="w-5 h-5" />,
          color: 'bg-slate-800 text-slate-400 border-slate-700'
        }
    }
  }

  const result = getIcon(ext)

  return (
    <div className={`flex items-center justify-center rounded-lg border ${result.color} ${className}`}>
      {result.icon}
    </div>
  )
}
