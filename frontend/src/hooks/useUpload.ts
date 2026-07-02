// src/hooks/useUpload.ts
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { api } from '../api/client'
import toast from 'react-hot-toast'
import { UploadedFile } from '../types/api'

export function useUpload() {
  const { state, dispatch } = useApp()
  const [localFiles, setLocalFiles] = useState<UploadedFile[]>([])

  const validateFile = (file: File): string | null => {
    const allowedExtensions = [
      '.pdf', '.docx', '.doc', '.xlsx', '.xls', '.png', '.jpg', '.jpeg', '.tiff', '.bmp', '.pptx', '.ppt'
    ]
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    if (!allowedExtensions.includes(ext)) {
      return `File type ${ext} is not supported.`
    }
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return `File size exceeds 50 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).`
    }
    return null
  }

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return

    const validated: UploadedFile[] = files.map(f => {
      const err = validateFile(f)
      return {
        name: f.name,
        size: f.size,
        type: f.type,
        status: err ? 'failed' : 'pending',
        error: err || undefined
      }
    })

    setLocalFiles(validated)
    dispatch({ type: 'SET_UPLOADED_FILES', payload: validated })

    const validFiles = files.filter(f => !validateFile(f))
    if (validFiles.length === 0) {
      toast.error('No valid files to upload')
      dispatch({ type: 'SET_UPLOAD_STATUS', payload: 'error' })
      return
    }

    if (files.length > 10) {
      toast.error('Maximum of 10 files allowed per session')
      dispatch({ type: 'SET_UPLOAD_STATUS', payload: 'error' })
      return
    }

    dispatch({ type: 'SET_UPLOAD_STATUS', payload: 'uploading' })
    toast.loading('Uploading documents & extracting with Azure AI...', { id: 'upload' })

    try {
      // Mock progress update or transition state
      const updateStatus = (status: UploadedFile['status']) => {
        const next = validated.map(f => f.status === 'failed' ? f : { ...f, status })
        setLocalFiles(next)
        dispatch({ type: 'SET_UPLOADED_FILES', payload: next })
      }

      updateStatus('uploading')
      
      const res = await api.upload(validFiles)
      const data = res.data

      updateStatus('completed')
      dispatch({ type: 'SET_SESSION_ID', payload: data.session_id })
      dispatch({ type: 'SET_UPLOAD_STATUS', payload: 'done' })
      
      toast.success(`Successfully uploaded ${data.doc_count} documents!`, { id: 'upload' })
    } catch (err: any) {
      console.error(err)
      const errMessage = err.message || 'File upload failed'
      
      const next = validated.map(f => f.status === 'failed' ? f : { ...f, status: 'failed' as const, error: errMessage })
      setLocalFiles(next)
      dispatch({ type: 'SET_UPLOADED_FILES', payload: next })
      
      dispatch({ type: 'SET_UPLOAD_STATUS', payload: 'error' })
      toast.error(`Upload failed: ${errMessage}`, { id: 'upload' })
    }
  }

  const removeFile = (index: number) => {
    const next = [...localFiles]
    next.splice(index, 1)
    setLocalFiles(next)
    dispatch({ type: 'SET_UPLOADED_FILES', payload: next })
  }

  return {
    uploadedFiles: localFiles,
    uploadStatus: state.uploadStatus,
    uploadFiles,
    removeFile
  }
}
