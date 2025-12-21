'use client'

import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { AlertCircle, X } from 'lucide-react'
import { handleApiError } from '@/lib/utils/errorHandler'

interface ErrorToastProps {
  error: any
  title?: string
}

export function ErrorToast({ error, title = 'Error' }: ErrorToastProps) {
  useEffect(() => {
    const message = handleApiError(error)
    toast.error(message, {
      duration: 5000,
      icon: <AlertCircle className="w-5 h-5" />,
      style: {
        background: '#fee2e2',
        color: '#991b1b',
        border: '1px solid #fca5a5',
      },
    })
  }, [error, title])

  return null
}

/**
 * Hook for handling errors with toast notifications
 */
export function useErrorHandler() {
  const handleError = (error: any, customMessage?: string) => {
    const message = customMessage || handleApiError(error)
    toast.error(message, {
      duration: 5000,
      icon: <AlertCircle className="w-5 h-5" />,
    })
  }

  const handleSuccess = (message: string) => {
    toast.success(message, {
      duration: 3000,
    })
  }

  return { handleError, handleSuccess }
}

