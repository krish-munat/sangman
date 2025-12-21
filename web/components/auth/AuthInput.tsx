'use client'

import { forwardRef, useState } from 'react'
import { LucideIcon, Eye, EyeOff } from 'lucide-react'

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon?: LucideIcon
  error?: string
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, type = 'text', icon: Icon, error, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    
    // Calculate the actual input type - toggle between text/password for password fields
    const actualInputType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
      <div className="w-full">
        <div className="relative">
          {/* Input MUST come before icon for peer selectors to work */}
          <input
            {...props}
            ref={ref}
            type={actualInputType}
            placeholder=" "
            className={`peer w-full rounded-lg border bg-white dark:bg-neutral-800 py-3 text-sm
            text-neutral-900 dark:text-neutral-100
            ${Icon ? 'pl-12' : 'pl-4'}
            ${isPassword ? 'pr-12' : 'pr-4'}
            focus:outline-none focus:ring-2 transition-all
            ${error
              ? 'border-red-500 focus:ring-red-400 dark:border-red-600'
              : 'border-gray-300 dark:border-neutral-600 focus:ring-primary-500 focus:border-transparent'
            }
            ${className}`}
          />

          {/* Icon - hides when user types */}
          {Icon && (
            <Icon
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400
              transition-opacity duration-200 peer-focus:opacity-0 peer-[:not(:placeholder-shown)]:opacity-0"
            />
          )}

          {/* Floating Label */}
          <label
            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-gray-500 dark:text-neutral-400
            transition-all duration-200 origin-left bg-white dark:bg-neutral-800 px-1
            ${Icon ? 'left-11' : 'left-3'}
            peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm
            peer-focus:top-0 peer-focus:text-xs peer-focus:text-primary-600 peer-focus:left-3 dark:peer-focus:text-primary-400
            peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:left-3
            peer-[:not(:placeholder-shown)]:text-neutral-600 dark:peer-[:not(:placeholder-shown)]:text-neutral-300`}
          >
            {label}
          </label>

          {/* Password Toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 
              dark:hover:text-neutral-300 transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-1.5 text-xs text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

AuthInput.displayName = 'AuthInput'

export default AuthInput
