'use client'

import { forwardRef, useState, useEffect } from 'react'
import { Phone, ChevronDown } from 'lucide-react'
import { COUNTRY_CODES, validatePhoneByCountry, type CountryCode } from '@/lib/utils/validation'

interface PhoneInputProps {
  label: string
  value?: string
  error?: string
  countryCode: string
  onCountryCodeChange: (code: string) => void
  onPhoneChange: (phone: string) => void
  disabled?: boolean
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ label, value = '', error, countryCode, onCountryCodeChange, onPhoneChange, disabled }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const [localPhone, setLocalPhone] = useState(value)
    const [validationError, setValidationError] = useState<string | undefined>()

    const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0]

    useEffect(() => {
      setLocalPhone(value)
    }, [value])

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value.replace(/\D/g, '')
      setLocalPhone(newValue)
      onPhoneChange(newValue)

      // Validate on change
      if (newValue.length > 0) {
        const validation = validatePhoneByCountry(newValue, countryCode)
        setValidationError(validation.error)
      } else {
        setValidationError(undefined)
      }
    }

    const handleCountryChange = (country: CountryCode) => {
      onCountryCodeChange(country.code)
      setIsOpen(false)
      
      // Re-validate with new country
      if (localPhone.length > 0) {
        const validation = validatePhoneByCountry(localPhone, country.code)
        setValidationError(validation.error)
      }
    }

    const displayError = error || validationError

    return (
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
        <div className="relative flex">
          {/* Country Code Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => !disabled && setIsOpen(!isOpen)}
              disabled={disabled}
              className={`flex items-center gap-1 px-3 py-3 rounded-l-lg border bg-gray-50 dark:bg-neutral-700 
                text-sm font-medium min-w-[90px] justify-between
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-neutral-600'}
                ${displayError
                  ? 'border-red-500 dark:border-red-600'
                  : 'border-gray-300 dark:border-neutral-600 border-r-0'
                }`}
            >
              <span className="text-lg mr-1">{selectedCountry.flag}</span>
              <span className="text-neutral-700 dark:text-neutral-200">{selectedCountry.code}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsOpen(false)}
                />
                <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-neutral-800 border border-gray-200 
                  dark:border-neutral-600 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                  {COUNTRY_CODES.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountryChange(country)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-100 
                        dark:hover:bg-neutral-700 text-sm transition-colors
                        ${country.code === countryCode ? 'bg-primary-50 dark:bg-primary-900/30' : ''}`}
                    >
                      <span className="text-lg">{country.flag}</span>
                      <span className="flex-1 text-neutral-900 dark:text-neutral-100">{country.country}</span>
                      <span className="text-gray-500 dark:text-gray-400">{country.code}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Phone Input */}
          <div className="relative flex-1">
            <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={ref}
              type="tel"
              value={localPhone}
              onChange={handlePhoneChange}
              disabled={disabled}
              placeholder={`${selectedCountry.minLength} digits`}
              maxLength={selectedCountry.maxLength + 5}
              className={`w-full rounded-r-lg border bg-white dark:bg-neutral-800 py-3 pl-10 pr-4 text-sm
                text-neutral-900 dark:text-neutral-100
                focus:outline-none focus:ring-2 transition-all
                ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}
                ${displayError
                  ? 'border-red-500 focus:ring-red-400 dark:border-red-600'
                  : 'border-gray-300 dark:border-neutral-600 focus:ring-primary-500 focus:border-transparent'
                }`}
            />
          </div>
        </div>

        {/* Phone format hint */}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Phone number should be {selectedCountry.minLength === selectedCountry.maxLength 
            ? `${selectedCountry.minLength} digits` 
            : `${selectedCountry.minLength}-${selectedCountry.maxLength} digits`} for {selectedCountry.country}
        </p>

        {/* Error Message */}
        {displayError && (
          <p className="mt-1 text-xs text-red-500">{displayError}</p>
        )}
      </div>
    )
  }
)

PhoneInput.displayName = 'PhoneInput'

export default PhoneInput

