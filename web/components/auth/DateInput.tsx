'use client'

import { useState, useEffect, useRef } from 'react'
import { Calendar, AlertCircle, CheckCircle } from 'lucide-react'

interface DateInputProps {
  label: string
  value?: string // ISO format: YYYY-MM-DD
  onChange: (isoDate: string) => void
  error?: string
  placeholder?: string
  maxDate?: Date
  minDate?: Date
}

export default function DateInput({
  label,
  value,
  onChange,
  error,
  placeholder = 'DD / MM / YYYY',
  maxDate = new Date(),
  minDate,
}: DateInputProps) {
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [localError, setLocalError] = useState<string | undefined>()
  
  const monthRef = useRef<HTMLInputElement>(null)
  const yearRef = useRef<HTMLInputElement>(null)

  // Parse initial value
  useEffect(() => {
    if (value) {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        setDay(date.getDate().toString().padStart(2, '0'))
        setMonth((date.getMonth() + 1).toString().padStart(2, '0'))
        setYear(date.getFullYear().toString())
      }
    }
  }, [value])

  // Calculate age
  const calculateAge = (): number | null => {
    if (!day || !month || !year || year.length !== 4) return null
    
    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    if (isNaN(birthDate.getTime())) return null
    
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age >= 0 && age <= 120 ? age : null
  }

  // Validate and update
  const validateAndUpdate = (d: string, m: string, y: string) => {
    setLocalError(undefined)
    
    // Only validate if all fields have values
    if (d && m && y && y.length === 4) {
      const dayNum = parseInt(d)
      const monthNum = parseInt(m)
      const yearNum = parseInt(y)
      
      // Basic validation
      if (monthNum < 1 || monthNum > 12) {
        setLocalError('Invalid month')
        return
      }
      
      // Days in month validation
      const daysInMonth = new Date(yearNum, monthNum, 0).getDate()
      if (dayNum < 1 || dayNum > daysInMonth) {
        setLocalError(`Invalid day for this month`)
        return
      }
      
      const date = new Date(yearNum, monthNum - 1, dayNum)
      
      // Future date check
      if (maxDate && date > maxDate) {
        setLocalError('Date cannot be in the future')
        return
      }
      
      // Min date check
      if (minDate && date < minDate) {
        setLocalError('Date is too far in the past')
        return
      }
      
      // Age validation
      const age = calculateAge()
      if (age !== null && age > 120) {
        setLocalError('Please enter a valid birth date')
        return
      }
      
      // Valid - convert to ISO format
      const isoDate = `${yearNum}-${monthNum.toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`
      onChange(isoDate)
    }
  }

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 2)
    
    // Auto-correct obvious errors
    if (val.length === 2) {
      const num = parseInt(val)
      if (num > 31) val = '31'
      if (num === 0) val = '01'
    }
    
    setDay(val)
    
    // Auto-focus month
    if (val.length === 2) {
      monthRef.current?.focus()
    }
    
    validateAndUpdate(val, month, year)
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 2)
    
    // Auto-correct
    if (val.length === 2) {
      const num = parseInt(val)
      if (num > 12) val = '12'
      if (num === 0) val = '01'
    }
    
    setMonth(val)
    
    // Auto-focus year
    if (val.length === 2) {
      yearRef.current?.focus()
    }
    
    validateAndUpdate(day, val, year)
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4)
    setYear(val)
    validateAndUpdate(day, month, val)
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: 'day' | 'month' | 'year'
  ) => {
    // Handle backspace to move to previous field
    if (e.key === 'Backspace') {
      if (field === 'month' && month === '') {
        e.preventDefault()
        setDay(day.slice(0, -1))
        ;(e.target as HTMLInputElement).previousElementSibling?.previousElementSibling?.querySelector('input')?.focus()
      } else if (field === 'year' && year === '') {
        e.preventDefault()
        setMonth(month.slice(0, -1))
        monthRef.current?.focus()
      }
    }
  }

  const age = calculateAge()
  const displayError = error || localError
  const isValid = day && month && year && year.length === 4 && !displayError && age !== null

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      
      <div className={`relative flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
        displayError
          ? 'border-red-400 bg-red-50'
          : isValid
            ? 'border-emerald-400 bg-emerald-50/30'
            : isFocused
              ? 'border-sky-500 ring-4 ring-sky-100'
              : 'border-gray-200 bg-white'
      }`}>
        <Calendar className={`w-5 h-5 flex-shrink-0 ${
          displayError ? 'text-red-400' : isValid ? 'text-emerald-500' : 'text-gray-400'
        }`} />
        
        <div className="flex items-center gap-1 flex-1">
          {/* Day */}
          <input
            type="text"
            inputMode="numeric"
            value={day}
            onChange={handleDayChange}
            onKeyDown={(e) => handleKeyDown(e, 'day')}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="DD"
            maxLength={2}
            className="w-10 text-center font-medium text-gray-900 bg-transparent outline-none placeholder:text-gray-400"
            aria-label="Day"
          />
          
          <span className="text-gray-400 font-medium">/</span>
          
          {/* Month */}
          <input
            ref={monthRef}
            type="text"
            inputMode="numeric"
            value={month}
            onChange={handleMonthChange}
            onKeyDown={(e) => handleKeyDown(e, 'month')}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="MM"
            maxLength={2}
            className="w-10 text-center font-medium text-gray-900 bg-transparent outline-none placeholder:text-gray-400"
            aria-label="Month"
          />
          
          <span className="text-gray-400 font-medium">/</span>
          
          {/* Year */}
          <input
            ref={yearRef}
            type="text"
            inputMode="numeric"
            value={year}
            onChange={handleYearChange}
            onKeyDown={(e) => handleKeyDown(e, 'year')}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="YYYY"
            maxLength={4}
            className="w-14 text-center font-medium text-gray-900 bg-transparent outline-none placeholder:text-gray-400"
            aria-label="Year"
          />
        </div>
        
        {/* Status icon */}
        {isValid && (
          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
        )}
      </div>
      
      {/* Age display */}
      {age !== null && !displayError && (
        <p className="mt-2 text-sm text-emerald-600 flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4" />
          Age: {age} years
        </p>
      )}
      
      {/* Error message */}
      {displayError && (
        <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {displayError}
        </p>
      )}
      
      {/* Format hint */}
      {!isValid && !displayError && (
        <p className="mt-2 text-xs text-gray-500">
          Enter date in DD/MM/YYYY format (e.g., 15/08/1990)
        </p>
      )}
    </div>
  )
}

