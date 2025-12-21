'use client'

import { forwardRef, useState, useEffect, useMemo, useRef } from 'react'
import { Phone, ChevronDown, Search, Check, Globe } from 'lucide-react'
import { COUNTRY_CODES, validatePhoneByCountry, type CountryCode } from '@/lib/utils/validation'

interface PhoneInputProps {
  label: string
  value?: string
  error?: string
  countryCode: string
  onCountryCodeChange: (code: string) => void
  onPhoneChange: (phone: string) => void
  disabled?: boolean
  autoFocus?: boolean
}

// Group countries by region for easier selection
const REGIONS = [
  { id: 'Asia', label: 'Asia & Pacific', icon: '🌏' },
  { id: 'Middle East', label: 'Middle East', icon: '🏜️' },
  { id: 'Europe', label: 'Europe', icon: '🇪🇺' },
  { id: 'North America', label: 'North America', icon: '🌎' },
  { id: 'South America', label: 'South America', icon: '🌎' },
  { id: 'Africa', label: 'Africa', icon: '🌍' },
  { id: 'Oceania', label: 'Oceania', icon: '🏝️' },
  { id: 'Caribbean', label: 'Caribbean', icon: '🏖️' },
] as const

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ label, value = '', error, countryCode, onCountryCodeChange, onPhoneChange, disabled, autoFocus }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const [localPhone, setLocalPhone] = useState(value)
    const [validationError, setValidationError] = useState<string | undefined>()
    const [searchQuery, setSearchQuery] = useState('')
    const searchInputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const selectedCountry = useMemo(() => 
      COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0],
      [countryCode]
    )

    // Filter countries based on search query
    const filteredCountries = useMemo(() => {
      if (!searchQuery.trim()) return COUNTRY_CODES
      const query = searchQuery.toLowerCase()
      return COUNTRY_CODES.filter(c => 
        c.country.toLowerCase().includes(query) || 
        c.code.includes(query)
      )
    }, [searchQuery])

    // Group filtered countries by region
    const groupedCountries = useMemo(() => {
      const groups: Record<string, typeof COUNTRY_CODES[number][]> = {}
      filteredCountries.forEach(country => {
        const region = country.region || 'Other'
        if (!groups[region]) groups[region] = []
        groups[region].push(country)
      })
      return groups
    }, [filteredCountries])

    useEffect(() => {
      setLocalPhone(value)
    }, [value])

    // Focus search input when dropdown opens
    useEffect(() => {
      if (isOpen && searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 100)
      }
    }, [isOpen])

    // Close dropdown on escape key
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsOpen(false)
      }
      if (isOpen) {
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
      }
    }, [isOpen])

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

    const handleCountryChange = (country: typeof COUNTRY_CODES[number]) => {
      onCountryCodeChange(country.code)
      setIsOpen(false)
      setSearchQuery('')
      
      // Re-validate with new country
      if (localPhone.length > 0) {
        const validation = validatePhoneByCountry(localPhone, country.code)
        setValidationError(validation.error)
      }
    }

    const displayError = error || validationError

    return (
      <div className="w-full">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
        <div className="relative flex">
          {/* Country Code Dropdown Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => !disabled && setIsOpen(!isOpen)}
              disabled={disabled}
              aria-haspopup="listbox"
              aria-expanded={isOpen}
              aria-label={`Selected country: ${selectedCountry.country}`}
              className={`flex items-center gap-1.5 px-3 py-3.5 rounded-l-xl border-2 bg-gray-50 dark:bg-neutral-700 
                text-sm font-medium min-w-[100px] justify-between transition-all duration-200
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-neutral-600'}
                ${displayError
                  ? 'border-red-500 dark:border-red-600'
                  : isOpen
                    ? 'border-sky-500 ring-4 ring-sky-100 dark:ring-sky-900'
                    : 'border-gray-200 dark:border-neutral-600 border-r-0'
                }`}
            >
              <span className="text-xl">{selectedCountry.flag}</span>
              <span className="text-neutral-700 dark:text-neutral-200 font-semibold">{selectedCountry.code}</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => {
                    setIsOpen(false)
                    setSearchQuery('')
                  }}
                  aria-hidden="true"
                />
                <div 
                  ref={dropdownRef}
                  role="listbox"
                  aria-label="Select country"
                  className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-neutral-800 border border-gray-200 
                    dark:border-neutral-600 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                >
                  {/* Search Header */}
                  <div className="sticky top-0 bg-white dark:bg-neutral-800 p-3 border-b border-gray-100 dark:border-neutral-700">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search country or code..."
                        className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-neutral-700 
                          border border-gray-200 dark:border-neutral-600 rounded-xl
                          focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
                          transition-all duration-200"
                        aria-label="Search countries"
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <Globe className="w-3.5 h-3.5" />
                      <span>{COUNTRY_CODES.length} countries supported</span>
                    </div>
                  </div>

                  {/* Countries List */}
                  <div className="max-h-72 overflow-y-auto smooth-scroll">
                    {Object.keys(groupedCountries).length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        <p className="text-sm">No countries found</p>
                        <p className="text-xs mt-1">Try a different search term</p>
                      </div>
                    ) : (
                      REGIONS.map(region => {
                        const countries = groupedCountries[region.id]
                        if (!countries || countries.length === 0) return null
                        
                        return (
                          <div key={region.id}>
                            {/* Region Header */}
                            <div className="sticky top-0 px-4 py-2 bg-gray-50 dark:bg-neutral-700/50 border-b border-gray-100 dark:border-neutral-700">
                              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                <span>{region.icon}</span>
                                {region.label}
                                <span className="text-gray-400 font-normal">({countries.length})</span>
                              </p>
                            </div>
                            
                            {/* Countries in Region */}
                            {countries.map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                role="option"
                                aria-selected={country.code === countryCode}
                                onClick={() => handleCountryChange(country)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-sky-50 
                                  dark:hover:bg-sky-900/20 transition-colors duration-150
                                  ${country.code === countryCode ? 'bg-sky-50 dark:bg-sky-900/30' : ''}`}
                              >
                                <span className="text-xl">{country.flag}</span>
                                <span className="flex-1 text-neutral-900 dark:text-neutral-100 font-medium">
                                  {country.country}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 text-sm font-mono">
                                  {country.code}
                                </span>
                                {country.code === countryCode && (
                                  <Check className="w-4 h-4 text-sky-500" />
                                )}
                              </button>
                            ))}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Phone Input */}
          <div className="relative flex-1">
            <Phone className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={ref}
              type="tel"
              inputMode="numeric"
              value={localPhone}
              onChange={handlePhoneChange}
              disabled={disabled}
              autoFocus={autoFocus}
              placeholder={`${selectedCountry.minLength === selectedCountry.maxLength 
                ? `${selectedCountry.minLength} digits` 
                : `${selectedCountry.minLength}-${selectedCountry.maxLength} digits`}`}
              maxLength={selectedCountry.maxLength + 5}
              autoComplete="tel-national"
              aria-invalid={displayError ? 'true' : 'false'}
              aria-describedby={displayError ? 'phone-error' : 'phone-hint'}
              className={`w-full rounded-r-xl border-2 bg-white dark:bg-neutral-800 py-3.5 pl-12 pr-4 text-base
                text-neutral-900 dark:text-neutral-100 transition-all duration-200
                focus:outline-none focus:ring-4
                ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}
                ${displayError
                  ? 'border-red-400 focus:ring-red-100 focus:border-red-500 dark:border-red-600'
                  : localPhone.length > 0 && !validationError
                    ? 'border-emerald-400 focus:ring-emerald-100 focus:border-emerald-500 bg-emerald-50/30'
                    : 'border-gray-200 dark:border-neutral-600 focus:ring-sky-100 focus:border-sky-500'
                }`}
            />
            {/* Valid indicator */}
            {localPhone.length > 0 && !validationError && !displayError && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Check className="w-5 h-5 text-emerald-500 animate-check-bounce" />
              </div>
            )}
          </div>
        </div>

        {/* Phone format hint */}
        <p id="phone-hint" className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
          <span className="text-lg">{selectedCountry.flag}</span>
          Phone number should be {selectedCountry.minLength === selectedCountry.maxLength 
            ? `${selectedCountry.minLength} digits` 
            : `${selectedCountry.minLength}-${selectedCountry.maxLength} digits`} for {selectedCountry.country}
        </p>

        {/* Error Message */}
        {displayError && (
          <p id="phone-error" className="mt-2 text-sm text-red-500 flex items-center gap-1.5" role="alert">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
            {displayError}
          </p>
        )}
      </div>
    )
  }
)

PhoneInput.displayName = 'PhoneInput'

export default PhoneInput
