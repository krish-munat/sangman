'use client'

import { useState } from 'react'
import { Shield, CheckCircle, AlertTriangle, Info, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type EscrowStatus = 'HELD' | 'RELEASED' | 'REFUNDED' | 'DISPUTED'

interface EscrowStatusBadgeProps {
  status: EscrowStatus
  amount?: number
  appointmentDate?: string
  showTooltip?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig: Record<EscrowStatus, {
  icon: typeof Shield
  label: string
  description: string
  colors: string
  bgColors: string
  iconColors: string
}> = {
  HELD: {
    icon: Shield,
    label: 'Funds Secure in Vault',
    description: 'Your payment is safely held in Sangman Vault until your consultation is complete. The doctor will only receive payment after you confirm the service.',
    colors: 'text-emerald-700 dark:text-emerald-400',
    bgColors: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800',
    iconColors: 'text-emerald-500',
  },
  RELEASED: {
    icon: CheckCircle,
    label: 'Paid to Doctor',
    description: 'Payment has been successfully transferred to the doctor after service completion. Thank you for using Sangman!',
    colors: 'text-blue-700 dark:text-blue-400',
    bgColors: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
    iconColors: 'text-blue-500',
  },
  REFUNDED: {
    icon: CheckCircle,
    label: 'Refunded',
    description: 'Your payment has been refunded to your original payment method. It may take 3-5 business days to reflect.',
    colors: 'text-purple-700 dark:text-purple-400',
    bgColors: 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800',
    iconColors: 'text-purple-500',
  },
  DISPUTED: {
    icon: AlertTriangle,
    label: 'Payment Frozen',
    description: 'Your dispute has been registered and the payment is frozen. Our team will review and resolve within 24-48 hours.',
    colors: 'text-red-700 dark:text-red-400',
    bgColors: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800',
    iconColors: 'text-red-500',
  },
}

export default function EscrowStatusBadge({
  status,
  amount,
  appointmentDate,
  showTooltip = true,
  size = 'md',
}: EscrowStatusBadgeProps) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)
  const config = statusConfig[status]
  const Icon = config.icon

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1.5',
    md: 'px-3 py-2 text-sm gap-2',
    lg: 'px-4 py-3 text-base gap-2.5',
  }

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => showTooltip && setIsTooltipOpen(!isTooltipOpen)}
        className={`flex items-center ${sizeClasses[size]} rounded-full border ${config.bgColors} 
          ${config.colors} font-medium transition-all hover:shadow-sm`}
      >
        <Icon className={`${iconSizes[size]} ${config.iconColors}`} />
        <span>{config.label}</span>
        {showTooltip && (
          <Info className={`${iconSizes[size]} opacity-60`} />
        )}
      </button>

      {/* Tooltip/Modal */}
      <AnimatePresence>
        {isTooltipOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsTooltipOpen(false)}
            />
            
            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute z-50 top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 
                rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4"
            >
              <button
                onClick={() => setIsTooltipOpen(false)}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 
                  rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-start gap-3 mb-3">
                <div className={`p-2 rounded-lg ${config.bgColors}`}>
                  <Icon className={`w-5 h-5 ${config.iconColors}`} />
                </div>
                <div>
                  <h4 className={`font-semibold ${config.colors}`}>{config.label}</h4>
                  {amount && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                      ₹{amount.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {config.description}
              </p>
              
              {appointmentDate && status === 'HELD' && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500">
                    Auto-release scheduled: 1 hour after appointment ends
                  </p>
                </div>
              )}

              {/* Trust indicators */}
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Protected by Sangman Trust Engine</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// Compact version for lists
export function EscrowStatusPill({ status }: { status: EscrowStatus }) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium 
      ${config.bgColors} ${config.colors}`}>
      <Icon className="w-3 h-3" />
      {status === 'HELD' ? 'In Escrow' : status}
    </span>
  )
}

