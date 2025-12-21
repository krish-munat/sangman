'use client'

import { useState, useRef } from 'react'
import { Upload, File, X, Eye, Download, FileText, Image, AlertCircle } from 'lucide-react'
import { ProfileDocument } from '@/lib/store/familyStore'

interface DocumentUploadProps {
  documents: ProfileDocument[]
  onUpload: (document: Omit<ProfileDocument, 'id' | 'uploadedAt'>) => void
  onRemove: (documentId: string) => void
  maxFiles?: number
  maxSizeMB?: number
  acceptedTypes?: string[]
  label?: string
  hint?: string
}

const DOCUMENT_TYPES = [
  { value: 'id_proof', label: 'ID Proof (Aadhaar/PAN)' },
  { value: 'medical_report', label: 'Medical Report' },
  { value: 'prescription', label: 'Prescription' },
  { value: 'insurance', label: 'Insurance Document' },
  { value: 'other', label: 'Other Document' },
]

export default function DocumentUpload({
  documents,
  onUpload,
  onRemove,
  maxFiles = 10,
  maxSizeMB = 5,
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx'],
  label = 'Upload Documents',
  hint = 'Upload medical records, prescriptions, or ID proofs',
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedType, setSelectedType] = useState<ProfileDocument['type']>('medical_report')
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFiles = async (files: File[]) => {
    setError(null)

    // Check max files limit
    if (documents.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    for (const file of files) {
      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File ${file.name} exceeds ${maxSizeMB}MB limit`)
        continue
      }

      setIsUploading(true)

      // Simulate upload delay (in production, upload to cloud storage)
      await new Promise(resolve => setTimeout(resolve, 500))

      // Create a mock URL (in production, this would be the cloud storage URL)
      const mockUrl = URL.createObjectURL(file)

      onUpload({
        name: file.name,
        type: selectedType,
        url: mockUrl,
        size: file.size,
      })

      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <Image className="w-5 h-5 text-sky-500" />
    }
    if (ext === 'pdf') {
      return <FileText className="w-5 h-5 text-red-500" />
    }
    return <File className="w-5 h-5 text-gray-500" />
  }

  const getTypeLabel = (type: ProfileDocument['type']) => {
    return DOCUMENT_TYPES.find(t => t.value === type)?.label || type
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">{label}</label>
        <span className="text-xs text-gray-500">{documents.length}/{maxFiles} files</span>
      </div>

      {hint && (
        <p className="text-xs text-gray-500 -mt-2">{hint}</p>
      )}

      {/* Document Type Selector */}
      <div className="flex flex-wrap gap-2">
        {DOCUMENT_TYPES.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => setSelectedType(type.value as ProfileDocument['type'])}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedType === type.value
                ? 'bg-sky-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
          ${isDragging 
            ? 'border-sky-500 bg-sky-50' 
            : 'border-gray-200 hover:border-sky-300 hover:bg-gray-50'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-2">
          {isUploading ? (
            <>
              <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                <Upload className="w-6 h-6 text-sky-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Drop files here or <span className="text-sky-600">browse</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, Images, Documents up to {maxSizeMB}MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Uploaded Documents List */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Uploaded Documents</p>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  {getFileIcon(doc.name)}
                  <div>
                    <p className="text-sm font-medium text-gray-800 truncate max-w-[200px]">
                      {doc.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{getTypeLabel(doc.type)}</span>
                      <span>•</span>
                      <span>{formatFileSize(doc.size)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="View"
                  >
                    <Eye className="w-4 h-4 text-gray-600" />
                  </a>
                  <a
                    href={doc.url}
                    download={doc.name}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-gray-600" />
                  </a>
                  <button
                    type="button"
                    onClick={() => onRemove(doc.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    title="Remove"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

