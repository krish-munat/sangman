'use client'

import { useState, useRef, useEffect } from 'react'
import { Phone, ChevronDown, Check } from 'lucide-react'
import { COUNTRY_CODES } from '@/lib/utils/validation'

interface PhoneInputProps {
  label?: string
  countryCode: string
  onCountryCodeChange: (code: string) => void
  value: string
  onPhoneChange: (phone: string) => void
  error?: string
  disabled?: boolean
  placeholder?: string
}

export default function PhoneInput({
  label = 'Phone Number',
  countryCode,
  onCountryCodeChange,
  value,
  onPhoneChange,
  error,
  disabled = false,
  placeholder = 'Enter phone number',
}: PhoneInputProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode)

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, '')
    onPhoneChange(value)
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </label>
      )}
      
      <div className="flex gap-2">
        {/* Country Code Selector */}
        <div className="relative">
          <button
            ref={buttonRef}
            type="button"
            disabled={disabled}
            onClick={() => setShowDropdown(!showDropdown)}
            className={`flex items-center gap-2 px-3 py-3 rounded-lg border bg-white dark:bg-neutral-800 
              text-neutral-900 dark:text-neutral-100
              ${disabled ? 'bg-neutral-100 dark:bg-neutral-700 cursor-not-allowed opacity-60' : 'hover:bg-neutral-50 dark:hover:bg-neutral-750'}
              ${error ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'}
              focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all`}
          >
            <span className="text-sm font-medium">{countryCode}</span>
            <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div
              ref={dropdownRef}
              className="absolute z-50 mt-1 w-52 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 
                rounded-xl shadow-xl py-1 max-h-60 overflow-y-auto"
            >
              {COUNTRY_CODES.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    onCountryCodeChange(country.code)
                    setShowDropdown(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors
                    ${countryCode === country.code ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-neutral-700 dark:text-neutral-300'}`}
                >
                  <span className="flex items-center gap-2">
                    <span className="font-medium">{country.code}</span>
                    <span className="text-neutral-500 dark:text-neutral-400">{country.country}</span>
                  </span>
                  {countryCode === country.code && (
                    <Check className="w-4 h-4 text-primary-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Phone Input */}
        <div className="relative flex-1">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="tel"
            value={value}
            onChange={handlePhoneInput}
            disabled={disabled}
            placeholder={placeholder}
            className={`w-full pl-11 pr-4 py-3 rounded-lg border bg-white dark:bg-neutral-800 
              text-neutral-900 dark:text-neutral-100
              ${disabled ? 'bg-neutral-100 dark:bg-neutral-700 cursor-not-allowed' : ''}
              ${error ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'}
              focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all`}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Helper text */}
      {selectedCountry && !error && (
        <p className="text-xs text-neutral-500">
          {selectedCountry.minLength === selectedCountry.maxLength 
            ? `Enter ${selectedCountry.minLength} digit phone number`
            : `Enter ${selectedCountry.minLength}-${selectedCountry.maxLength} digit phone number`}
        </p>
      )}
    </div>
  )
}
