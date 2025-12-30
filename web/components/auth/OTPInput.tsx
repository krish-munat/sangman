'use client'

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react'

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  error?: boolean
  autoFocus?: boolean
}

export default function OTPInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  autoFocus = true,
}: OTPInputProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length)
  }, [length])

  // Auto focus first input
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  // Focus management based on value
  useEffect(() => {
    const valueLength = value.length
    if (valueLength < length && inputRefs.current[valueLength]) {
      inputRefs.current[valueLength]?.focus()
      setActiveIndex(valueLength)
    }
  }, [value, length])

  const handleChange = (index: number, inputValue: string) => {
    if (disabled) return

    // Only allow numbers
    const digit = inputValue.replace(/\D/g, '').slice(-1)
    
    if (digit) {
      const newValue = value.slice(0, index) + digit + value.slice(index + 1)
      onChange(newValue.slice(0, length))
      
      // Move to next input
      if (index < length - 1 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus()
        setActiveIndex(index + 1)
      }
      
      // Check if complete
      if (newValue.length === length && onComplete) {
        onComplete(newValue)
      }
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return

    if (e.key === 'Backspace') {
      e.preventDefault()
      
      if (value[index]) {
        // Clear current digit
        const newValue = value.slice(0, index) + value.slice(index + 1)
        onChange(newValue)
      } else if (index > 0) {
        // Move to previous input and clear it
        const newValue = value.slice(0, index - 1) + value.slice(index)
        onChange(newValue)
        inputRefs.current[index - 1]?.focus()
        setActiveIndex(index - 1)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
      setActiveIndex(index - 1)
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
      setActiveIndex(index + 1)
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return
    
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    
    if (pastedData) {
      onChange(pastedData)
      
      // Focus the appropriate input
      const nextIndex = Math.min(pastedData.length, length - 1)
      inputRefs.current[nextIndex]?.focus()
      setActiveIndex(nextIndex)
      
      // Check if complete
      if (pastedData.length === length && onComplete) {
        onComplete(pastedData)
      }
    }
  }

  const handleFocus = (index: number) => {
    setActiveIndex(index)
    // Select the input value on focus
    inputRefs.current[index]?.select()
  }

  return (
    <div className="flex gap-2 sm:gap-3 justify-center">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className={`
            w-10 h-12 sm:w-12 sm:h-14 md:w-14 md:h-16
            text-center text-xl sm:text-2xl font-bold
            border-2 rounded-xl
            transition-all duration-200
            focus:outline-none
            ${disabled 
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
              : error
                ? 'border-red-300 bg-red-50 text-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                : value[index]
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'
                  : activeIndex === index
                    ? 'border-sky-500 bg-white text-gray-900 ring-2 ring-sky-200'
                    : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-200'
            }
          `}
          aria-label={`Digit ${index + 1} of ${length}`}
        />
      ))}
    </div>
  )
}






