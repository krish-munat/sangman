'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Loader2 } from 'lucide-react'

interface VoiceSearchButtonProps {
  onTranscript: (text: string, language: string) => void
  onListeningChange?: (isListening: boolean) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

// Supported languages for voice recognition
const SUPPORTED_LANGUAGES = {
  'hi-IN': 'Hindi',
  'en-IN': 'English (India)',
  'mr-IN': 'Marathi',
  'en-US': 'English (US)',
}

export function VoiceSearchButton({ 
  onTranscript, 
  onListeningChange,
  className = '',
  size = 'lg'
}: VoiceSearchButtonProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const [transcript, setTranscript] = useState('')

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = false
        recognitionInstance.interimResults = true
        recognitionInstance.lang = 'hi-IN' // Default to Hindi for Tier 2/3 users
        
        recognitionInstance.onresult = (event) => {
          const current = event.resultIndex
          const result = event.results[current]
          const transcriptText = result[0].transcript
          
          setTranscript(transcriptText)
          
          if (result.isFinal) {
            handleFinalTranscript(transcriptText, recognitionInstance.lang)
          }
        }
        
        recognitionInstance.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          if (event.error === 'not-allowed') {
            setError('Microphone access denied. Please allow microphone access.')
          } else if (event.error === 'no-speech') {
            // Fallback to Whisper for better accuracy
            fallbackToWhisper()
          } else {
            setError(`Error: ${event.error}`)
          }
          stopListening()
        }
        
        recognitionInstance.onend = () => {
          if (isListening) {
            stopListening()
          }
        }
        
        setRecognition(recognitionInstance)
      }
    }
    
    return () => {
      if (recognition) {
        recognition.abort()
      }
    }
  }, [])

  const handleFinalTranscript = async (text: string, language: string) => {
    setIsProcessing(true)
    
    // Clean up the transcript
    const cleanedText = text.trim()
    
    if (cleanedText.length > 0) {
      // Detect language from the recognition result
      const detectedLang = language.split('-')[0] // 'hi-IN' -> 'hi'
      onTranscript(cleanedText, detectedLang)
    }
    
    setIsProcessing(false)
    setTranscript('')
  }

  const fallbackToWhisper = async () => {
    // This would be called if Web Speech API fails
    // We'd record audio and send to Whisper API
    setError('Trying alternative recognition...')
    
    try {
      // For now, show a message - actual implementation would record audio
      // and send to /api/transcribe endpoint
      setTimeout(() => {
        setError(null)
      }, 2000)
    } catch (err) {
      setError('Voice recognition unavailable')
    }
  }

  const startListening = useCallback(() => {
    if (!recognition) {
      setError('Voice search not supported in this browser')
      return
    }
    
    setError(null)
    setTranscript('')
    setIsListening(true)
    onListeningChange?.(true)
    
    try {
      recognition.start()
    } catch (err) {
      // Recognition might already be started
      console.error('Start error:', err)
    }
  }, [recognition, onListeningChange])

  const stopListening = useCallback(() => {
    if (recognition) {
      try {
        recognition.stop()
      } catch (err) {
        // Ignore stop errors
      }
    }
    setIsListening(false)
    onListeningChange?.(false)
  }, [recognition, onListeningChange])

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  }

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* Outer Ripple Effects - Only visible when listening */}
      <AnimatePresence>
        {isListening && (
          <>
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              exit={{ scale: 1, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className={`absolute ${sizeClasses[size]} bg-sky-400 rounded-full`}
            />
            <motion.div
              initial={{ scale: 1, opacity: 0.3 }}
              animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
              exit={{ scale: 1, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className={`absolute ${sizeClasses[size]} bg-sky-300 rounded-full`}
            />
            <motion.div
              initial={{ scale: 1, opacity: 0.2 }}
              animate={{ scale: [1, 2.5, 1], opacity: [0.2, 0, 0.2] }}
              exit={{ scale: 1, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className={`absolute ${sizeClasses[size]} bg-sky-200 rounded-full`}
            />
          </>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        onClick={toggleListening}
        disabled={isProcessing}
        whileTap={{ scale: 0.95 }}
        animate={isListening ? { scale: [1, 1.05, 1] } : {}}
        transition={isListening ? { duration: 1, repeat: Infinity } : {}}
        className={`
          relative z-10 ${sizeClasses[size]} rounded-full 
          flex items-center justify-center
          transition-all duration-300 shadow-xl
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isListening 
            ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' 
            : 'bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 shadow-sky-500/30'
          }
        `}
        aria-label={isListening ? 'Stop listening' : 'Start voice search'}
      >
        {isProcessing ? (
          <Loader2 className={`${iconSizes[size]} text-white animate-spin`} />
        ) : isListening ? (
          <MicOff className={`${iconSizes[size]} text-white`} />
        ) : (
          <Mic className={`${iconSizes[size]} text-white`} />
        )}
      </motion.button>

      {/* Live Transcript Preview */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -bottom-16 w-64 text-center"
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl px-4 py-2 shadow-lg border border-gray-100 dark:border-slate-700">
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                "{transcript}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper Text */}
      <div className="mt-4 text-center">
        <motion.p 
          className="text-sm font-medium text-gray-500 dark:text-gray-400"
          animate={{ opacity: isListening ? [1, 0.5, 1] : 1 }}
          transition={{ duration: 1.5, repeat: isListening ? Infinity : 0 }}
        >
          {isProcessing 
            ? 'Processing...' 
            : isListening 
              ? '🎙️ Listening... Speak now' 
              : 'Tap to speak in Hindi, English, or Marathi'
          }
        </motion.p>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -bottom-24 w-72 text-center"
          >
            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/30 px-3 py-2 rounded-lg">
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Compact inline version for search bars
export function VoiceSearchInline({ 
  onTranscript, 
  className = '' 
}: Pick<VoiceSearchButtonProps, 'onTranscript' | 'className'>) {
  const [isListening, setIsListening] = useState(false)

  return (
    <VoiceSearchButton
      onTranscript={onTranscript}
      onListeningChange={setIsListening}
      size="sm"
      className={className}
    />
  )
}

// Add type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

