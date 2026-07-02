// src/components/upload/FileDropzone.tsx
import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud } from 'lucide-react'
import toast from 'react-hot-toast'

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void
  disabled?: boolean
}

export function FileDropzone({ onFilesSelected, disabled = false }: FileDropzoneProps) {
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(file => {
        const errorMsg = file.errors?.[0]?.message || 'File validation failed'
        toast.error(`${file.file.name}: ${errorMsg}`)
      })
    }

    if (acceptedFiles.length > 0) {
      onFilesSelected(acceptedFiles)
    }
  }, [onFilesSelected])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    maxSize: 50 * 1024 * 1024, // 50MB
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/tiff': ['.tiff'],
      'image/bmp': ['.bmp'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
    }
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
        isDragActive 
          ? 'border-blue-500 bg-blue-500/5' 
          : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-4 py-6">
        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div>
          <p className="font-bold text-slate-200">
            {isDragActive ? 'Drop your files here...' : 'Drag & drop financial documents here'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            or click to browse your local device
          </p>
        </div>
        <div className="text-[10px] text-slate-500 max-w-sm mt-2 leading-relaxed">
          Supports PDF, Word, Excel, PowerPoint, and Image formats.<br />
          Maximum file size 50 MB. Limit 10 files per session.
        </div>
      </div>
    </div>
  )
}
