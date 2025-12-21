'use client'

import { useState, useEffect } from 'react'
import { Upload, CheckCircle, XCircle, Clock, FileText, User, CreditCard, GraduationCap, Camera } from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import { validateFileUpload, handleError } from '@/lib/utils/errorHandler'
import toast from 'react-hot-toast'

export default function VerificationPage() {
  const { user, updateUser } = useAuthStore()
  const doctor = user as any
  const [documents, setDocuments] = useState({
    aadhaarCard: null as File | null,
    panCard: null as File | null,
    medicalLicense: null as File | null,
    degree: [] as File[],
    selfie: null as File | null,
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleFileUpload = (field: keyof typeof documents, file: File | null) => {
    try {
      if (file) {
        // Validate file
        const validation = validateFileUpload(file, {
          maxSize: 10, // 10MB
          allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
        })

        if (!validation.valid) {
          toast.error(validation.error || 'Invalid file')
          return
        }
      }

      setDocuments((prev) => ({ ...prev, [field]: file }))
      if (file) {
        toast.success('File uploaded successfully')
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to upload file')
    }
  }

  const handleSubmit = async () => {
    try {
      // Validate all required documents are uploaded
      if (!documents.aadhaarCard) {
        toast.error('Please upload Aadhaar Card')
        return
      }
      if (!documents.panCard) {
        toast.error('Please upload PAN Card')
        return
      }
      if (!documents.medicalLicense) {
        toast.error('Please upload Medical License')
        return
      }
      if (documents.degree.length === 0) {
        toast.error('Please upload at least one Medical Degree/Certificate')
        return
      }
      if (!documents.selfie) {
        toast.error('Please upload a selfie for identity verification')
        return
      }

      // TODO: Submit documents for verification via API
      updateUser({ verificationStatus: 'pending' })
      toast.success('Documents submitted for verification. We will review them shortly.')
    } catch (error) {
      const errorMessage = handleError(error, 'Failed to submit documents. Please try again.')
      toast.error(errorMessage)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading...</p>
        </div>
      </div>
    )
  }

  const verificationStatus = doctor?.verificationStatus || 'pending'

  const documentFields = [
    {
      id: 'aadhaarCard',
      label: 'Aadhaar Card',
      icon: CreditCard,
      required: true,
      description: 'Upload front and back of your Aadhaar card',
    },
    {
      id: 'panCard',
      label: 'PAN Card',
      icon: CreditCard,
      required: true,
      description: 'Upload a clear photo of your PAN card',
    },
    {
      id: 'medicalLicense',
      label: 'Medical License',
      icon: FileText,
      required: true,
      description: 'Upload your valid medical license certificate',
    },
    {
      id: 'degree',
      label: 'Medical Degree/Certificates',
      icon: GraduationCap,
      required: true,
      description: 'Upload your medical degree and relevant certificates',
      multiple: true,
    },
    {
      id: 'selfie',
      label: 'Selfie for Identity Verification',
      icon: Camera,
      required: true,
      description: 'Take a clear selfie holding your ID card',
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Doctor Verification
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">
          Complete your verification to start accepting appointments
        </p>

        {/* Verification Status */}
        {verificationStatus !== 'pending' && (
          <div
            className={`card mb-6 ${
              verificationStatus === 'approved'
                ? 'bg-success-50 dark:bg-success-900 border-success-200'
                : 'bg-emergency-50 dark:bg-emergency-900 border-emergency-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {verificationStatus === 'approved' ? (
                <CheckCircle className="w-6 h-6 text-success-500" />
              ) : (
                <XCircle className="w-6 h-6 text-emergency-500" />
              )}
              <div>
                <h3 className="font-semibold mb-1">
                  {verificationStatus === 'approved'
                    ? 'Verification Approved'
                    : 'Verification Rejected'}
                </h3>
                <p className="text-sm">
                  {verificationStatus === 'approved'
                    ? 'Your profile is verified and visible to patients'
                    : 'Please review and resubmit your documents'}
                </p>
              </div>
            </div>
          </div>
        )}

        {verificationStatus === 'pending' && (
          <div className="card mb-6 bg-yellow-50 dark:bg-yellow-900 border-yellow-200">
            <div className="icon-text-group items-start">
              <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold mb-1">Verification Pending</h3>
                <p className="text-sm">
                  Your documents are under review. We will notify you once verified.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Document Upload Forms */}
        <div className="space-y-6">
          {documentFields.map((field) => {
            const Icon = field.icon
            const file = documents[field.id as keyof typeof documents]
            return (
              <div key={field.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="icon-text-group mb-2">
                      <Icon className="w-5 h-5 text-primary-500 flex-shrink-0" />
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        {field.label}
                        {field.required && (
                          <span className="text-emergency-500 ml-1">*</span>
                        )}
                      </h3>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {field.description}
                    </p>
                  </div>
                </div>

                <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg p-6 text-center">
                  {file ? (
                    <div className="space-y-2">
                      <CheckCircle className="w-8 h-8 text-success-500 mx-auto" />
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {Array.isArray(file)
                          ? `${file.length} file(s) uploaded`
                          : file.name}
                      </p>
                      <button
                        onClick={() => handleFileUpload(field.id as keyof typeof documents, null)}
                        className="text-sm text-emergency-500 hover:text-emergency-600"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          multiple={field.multiple}
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const files = e.target.files
                            if (files) {
                              if (field.multiple) {
                                handleFileUpload(
                                  field.id as keyof typeof documents,
                                  Array.from(files) as any
                                )
                              } else {
                                handleFileUpload(
                                  field.id as keyof typeof documents,
                                  files[0]
                                )
                              }
                            }
                          }}
                          className="hidden"
                        />
                        <span className="text-primary-500 hover:text-primary-600 font-medium">
                          Click to upload
                        </span>
                        <span className="text-neutral-600 dark:text-neutral-400 ml-2">
                          or drag and drop
                        </span>
                      </label>
                      <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-2">
                        PNG, JPG, PDF up to 10MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Submit Button */}
        {verificationStatus !== 'approved' && (
          <div className="mt-8">
            <button
              onClick={handleSubmit}
              disabled={
                !documents.aadhaarCard ||
                !documents.panCard ||
                !documents.medicalLicense ||
                documents.degree.length === 0 ||
                !documents.selfie ||
                verificationStatus === 'pending'
              }
              className="btn-primary w-full"
            >
              Submit for Verification
            </button>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center mt-4">
              All documents will be reviewed by our admin team. This process usually takes 24-48
              hours.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

