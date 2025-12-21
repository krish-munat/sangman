'use client'

import { forwardRef, useState, useEffect } from 'react'
import { Lock, Eye, EyeOff, Check, X } from 'lucide-react'
import { validatePasswordStrength, getPasswordStrengthLabel } from '@/lib/utils/validation'

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  error?: string
  showStrengthIndicator?: boolean
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, showStrengthIndicator = false, className = '', onChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [password, setPassword] = useState('')
    const [strength, setStrength] = useState(validatePasswordStrength(''))

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setPassword(value)
      setStrength(validatePasswordStrength(value))
      onChange?.(e)
    }

    const strengthInfo = getPasswordStrengthLabel(strength.score)

    return (
      <div className="w-full">
        <div className="relative">
          {/* Input */}
          <input
            {...props}
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            onChange={handleChange}
            placeholder=" "
            className={`peer w-full rounded-lg border bg-white dark:bg-neutral-800 py-3 text-sm
            text-neutral-900 dark:text-neutral-100 pl-12 pr-12
            focus:outline-none focus:ring-2 transition-all
            ${error
              ? 'border-red-500 focus:ring-red-400 dark:border-red-600'
              : 'border-gray-300 dark:border-neutral-600 focus:ring-primary-500 focus:border-transparent'
            }
            ${className}`}
          />

          {/* Icon */}
          <Lock
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400
            transition-opacity duration-200 peer-focus:opacity-0 peer-[:not(:placeholder-shown)]:opacity-0"
          />

          {/* Floating Label */}
          <label
            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-gray-500 dark:text-neutral-400
            transition-all duration-200 origin-left bg-white dark:bg-neutral-800 px-1 left-11
            peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm
            peer-focus:top-0 peer-focus:text-xs peer-focus:text-primary-600 peer-focus:left-3 dark:peer-focus:text-primary-400
            peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:left-3
            peer-[:not(:placeholder-shown)]:text-neutral-600 dark:peer-[:not(:placeholder-shown)]:text-neutral-300`}
          >
            {label}
          </label>

          {/* Password Toggle */}
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
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-1.5 text-xs text-red-500">{error}</p>
        )}

        {/* Strength Indicator */}
        {showStrengthIndicator && password.length > 0 && (
          <div className="mt-3 space-y-2">
            {/* Strength Bar */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    level <= strength.score
                      ? strengthInfo.color === 'red' ? 'bg-red-500'
                        : strengthInfo.color === 'orange' ? 'bg-orange-500'
                        : strengthInfo.color === 'yellow' ? 'bg-yellow-500'
                        : strengthInfo.color === 'lime' ? 'bg-lime-500'
                        : 'bg-green-500'
                      : 'bg-gray-200 dark:bg-neutral-700'
                  }`}
                />
              ))}
            </div>
            <p className={`text-xs font-medium ${
              strengthInfo.color === 'red' ? 'text-red-500'
                : strengthInfo.color === 'orange' ? 'text-orange-500'
                : strengthInfo.color === 'yellow' ? 'text-yellow-500'
                : strengthInfo.color === 'lime' ? 'text-lime-500'
                : 'text-green-500'
            }`}>
              {strengthInfo.label}
            </p>

            {/* Requirements Checklist */}
            <div className="grid grid-cols-2 gap-1 text-xs">
              <RequirementItem 
                met={strength.requirements.minLength} 
                text="Min 8 characters" 
              />
              <RequirementItem 
                met={strength.requirements.hasUppercase} 
                text="Uppercase letter" 
              />
              <RequirementItem 
                met={strength.requirements.hasLowercase} 
                text="Lowercase letter" 
              />
              <RequirementItem 
                met={strength.requirements.hasNumber} 
                text="Number" 
              />
              <RequirementItem 
                met={strength.requirements.hasSpecialChar} 
                text="Special character" 
              />
            </div>
          </div>
        )}
      </div>
    )
  }
)

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${met ? 'text-green-600' : 'text-gray-400'}`}>
      {met ? (
        <Check className="w-3.5 h-3.5" />
      ) : (
        <X className="w-3.5 h-3.5" />
      )}
      <span>{text}</span>
    </div>
  )
}

PasswordInput.displayName = 'PasswordInput'

export default PasswordInput

