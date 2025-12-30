'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, X, File, Image, AlertCircle } from 'lucide-react'
import type { ProfileDocument } from '@/types'

interface DocumentUploadProps {
  documents: ProfileDocument[]
  onUpload: (doc: Omit<ProfileDocument, 'id' | 'uploadedAt'>) => void
  onRemove: (docId: string) => void
  label?: string
  hint?: string
  maxSize?: number // in MB
  allowedTypes?: string[]
}

const DOCUMENT_TYPE_OPTIONS = [
  { value: 'prescription', label: 'Prescription' },
  { value: 'report', label: 'Medical Report' },
  { value: 'id_proof', label: 'ID Proof' },
  { value: 'insurance', label: 'Insurance Document' },
  { value: 'other', label: 'Other' },
]

export default function DocumentUpload({
  documents,
  onUpload,
  onRemove,
  label = 'Upload Documents',
  hint = 'Upload your medical documents',
  maxSize = 5, // 5MB default
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
}: DocumentUploadProps) {
  const [selectedType, setSelectedType] = useState<ProfileDocument['type']>('report')
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Please upload an image (JPG, PNG, WebP) or PDF.'
    }
    if (file.size > maxSize * 1024 * 1024) {
      return `File size exceeds ${maxSize}MB limit.`
    }
    return null
  }

  const handleFile = async (file: File) => {
    setError(null)
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setUploading(true)
    try {
      // In a real app, you would upload to a server/cloud storage
      // For demo, we create a local URL
      const url = URL.createObjectURL(file)
      
      onUpload({
        name: file.name,
        type: selectedType,
        url: url,
        size: file.size,
      })
    } catch (err) {
      setError('Failed to upload file. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const getFileIcon = (type: ProfileDocument['type']) => {
    switch (type) {
      case 'prescription':
        return <FileText className="w-5 h-5 text-blue-500" />
      case 'report':
        return <File className="w-5 h-5 text-green-500" />
      case 'id_proof':
        return <Image className="w-5 h-5 text-purple-500" />
      case 'insurance':
        return <FileText className="w-5 h-5 text-amber-500" />
      default:
        return <File className="w-5 h-5 text-neutral-500" />
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Document Type Selector */}
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
            Document Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as ProfileDocument['type'])}
            className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 
              bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
              focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {DOCUMENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Upload Area */}
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
            {label}
          </label>
          <div
            className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
              ${dragActive 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-400'
              }
              ${uploading ? 'opacity-50 pointer-events-none' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept={allowedTypes.join(',')}
              onChange={handleChange}
              className="hidden"
            />
            <Upload className={`w-6 h-6 mx-auto mb-2 ${dragActive ? 'text-primary-500' : 'text-neutral-400'}`} />
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {uploading ? 'Uploading...' : 'Drop file here or click to upload'}
            </p>
            <p className="text-xs text-neutral-500 mt-1">{hint}</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Documents List */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Uploaded Documents ({documents.length})
          </p>
          <div className="grid gap-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 
                  rounded-lg border border-neutral-200 dark:border-neutral-700"
              >
                {getFileIcon(doc.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                    {doc.name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {DOCUMENT_TYPE_OPTIONS.find(o => o.value === doc.type)?.label || doc.type}
                    {doc.size && ` • ${formatFileSize(doc.size)}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(doc.id)}
                  className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
                  aria-label="Remove document"
                >
                  <X className="w-4 h-4 text-neutral-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
