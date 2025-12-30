'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Mic, MicOff, X, Loader2, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

interface VoiceSearchInputProps {
  onResult?: (text: string) => void
  autoNavigate?: boolean
  placeholder?: string
  className?: string
}

export default function VoiceSearchInput({
  onResult,
  autoNavigate = true,
  placeholder = 'Search doctors, symptoms, or specialties...',
  className = '',
}: VoiceSearchInputProps) {
  const router = useRouter()
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [textInput, setTextInput] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [confidence, setConfidence] = useState(0)
  
  const recognitionRef = useRef<any>(null)
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle search completion
  const handleSearchComplete = useCallback((query: string) => {
    setIsListening(false)
    setShowModal(false)
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        // Ignore
      }
    }
    
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current)
    }
    
    const cleanQuery = query.trim()
    if (cleanQuery) {
      if (autoNavigate) {
        router.push(`/patient/discover?q=${encodeURIComponent(cleanQuery)}`)
      }
      onResult?.(cleanQuery)
    }
  }, [autoNavigate, router, onResult])

  // Initialize speech recognition on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      console.log('Speech recognition not supported')
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-IN'
      recognition.maxAlternatives = 1

      recognition.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            finalTranscript += result[0].transcript
            setConfidence(result[0].confidence || 0.9)
          } else {
            interimTranscript += result[0].transcript
          }
        }

        const displayText = finalTranscript || interimTranscript
        setTranscript(displayText)

        // Auto-complete after final result
        if (finalTranscript) {
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current)
          }
          silenceTimeoutRef.current = setTimeout(() => {
            handleSearchComplete(finalTranscript)
          }, 1500)
        }
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        
        switch (event.error) {
          case 'not-allowed':
            toast.error('Microphone access denied. Please allow in browser settings.')
            break
          case 'no-speech':
            toast.error('No speech detected. Try again.')
            break
          case 'network':
            toast.error('Network error. Check your connection.')
            break
          case 'aborted':
            // User cancelled, no error needed
            break
          default:
            toast.error('Voice search failed. Try typing instead.')
        }
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    } catch (error) {
      console.error('Failed to create SpeechRecognition:', error)
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          // Ignore
        }
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
      }
    }
  }, [handleSearchComplete])

  const startListening = async () => {
    setTranscript('')
    setConfidence(0)

    // Check browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error('Voice search is not supported in this browser. Please use Chrome.')
      return
    }

    // Request microphone permission
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop())
    } catch (error: any) {
      console.error('Microphone error:', error)
      if (error.name === 'NotAllowedError') {
        toast.error('Microphone access denied. Please allow in browser settings.')
      } else {
        toast.error('Could not access microphone.')
      }
      return
    }

    setShowModal(true)

    // Re-initialize recognition if needed
    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-IN'
      recognitionRef.current = recognition
    }

    try {
      recognitionRef.current.start()
      setIsListening(true)
      toast.success('Listening... Speak now!', { duration: 2000 })
    } catch (error: any) {
      console.error('Start error:', error)
      if (error.message?.includes('already started')) {
        setIsListening(true)
      } else {
        toast.error('Could not start voice search.')
        setShowModal(false)
      }
    }
  }

  const stopListening = () => {
    setIsListening(false)
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        // Ignore
      }
    }
    
    if (transcript) {
      handleSearchComplete(transcript)
    }
  }

  const handleTextSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (textInput.trim()) {
      handleSearchComplete(textInput)
    }
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Search Input with Voice Button */}
      <form onSubmit={handleTextSearch} className="relative">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={placeholder}
          className="w-full px-5 py-4 pr-24 text-lg rounded-2xl border-2 border-gray-200 
            focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all
            placeholder:text-gray-400 bg-white dark:bg-gray-800 dark:border-gray-700
            dark:text-white dark:placeholder:text-gray-500"
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
          {textInput && (
            <button
              type="submit"
              className="p-2.5 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          )}
          
          <button
            type="button"
            onClick={startListening}
            className="p-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl 
              hover:from-red-600 hover:to-pink-600 transition-all shadow-lg"
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Voice Search Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => {
              stopListening()
              setShowModal(false)
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  stopListening()
                  setShowModal(false)
                }}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 
                  rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {isProcessing ? 'Processing...' : isListening ? 'Listening...' : 'Voice Search'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                  {isListening 
                    ? 'Speak your symptoms or doctor query' 
                    : 'Tap the mic to start'}
                </p>

                {/* Animated Microphone Button */}
                <div className="relative flex items-center justify-center mb-8">
                  {/* Pulsing rings when listening */}
                  {isListening && (
                    <>
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute w-32 h-32 rounded-full bg-red-500/20"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                        className="absolute w-24 h-24 rounded-full bg-red-500/30"
                      />
                    </>
                  )}

                  <motion.button
                    onClick={isListening ? stopListening : startListening}
                    disabled={isProcessing}
                    whileTap={{ scale: 0.95 }}
                    className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center 
                      transition-all shadow-xl ${
                        isProcessing 
                          ? 'bg-gray-400 cursor-not-allowed'
                          : isListening 
                            ? 'bg-gradient-to-br from-red-500 to-pink-600' 
                            : 'bg-gradient-to-br from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700'
                      }`}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    ) : isListening ? (
                      <MicOff className="w-8 h-8 text-white" />
                    ) : (
                      <Mic className="w-8 h-8 text-white" />
                    )}
                  </motion.button>
                </div>

                {/* Transcript Display */}
                <div className="min-h-[60px] mb-4">
                  {transcript ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4"
                    >
                      <p className="text-gray-800 dark:text-gray-200 text-lg font-medium">
                        "{transcript}"
                      </p>
                      {confidence > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          Confidence: {Math.round(confidence * 100)}%
                        </p>
                      )}
                    </motion.div>
                  ) : (
                    <p className="text-gray-400 text-sm">
                      Try: "Pet me dard" or "Heart specialist near me"
                    </p>
                  )}
                </div>

                {/* Search Button */}
                {transcript && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleSearchComplete(transcript)}
                    className="w-full py-3 px-6 bg-gradient-to-r from-sky-500 to-blue-600 
                      text-white font-semibold rounded-xl hover:from-sky-600 hover:to-blue-700 
                      transition-all shadow-lg"
                  >
                    Search "{transcript}"
                  </motion.button>
                )}

                {/* Language hint */}
                <p className="mt-4 text-xs text-gray-400">
                  Supports English & Hindi 🇮🇳
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
