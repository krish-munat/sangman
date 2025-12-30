'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Clock, 
  ThermometerSun,
  ArrowRight,
  Loader2,
  RefreshCw
} from 'lucide-react'

// Symptom quick-select chips
const SYMPTOM_CHIPS = [
  { label: 'High Fever', icon: '🤒', value: 'high fever' },
  { label: 'Headache', icon: '🤕', value: 'headache' },
  { label: 'Cough', icon: '😷', value: 'persistent cough' },
  { label: 'Body Pain', icon: '💪', value: 'body pain and weakness' },
  { label: 'Stomach Ache', icon: '🤢', value: 'stomach pain' },
  { label: 'Breathing Issue', icon: '😮‍💨', value: 'difficulty breathing' },
  { label: 'Skin Rash', icon: '🔴', value: 'skin rash or itching' },
  { label: 'Joint Pain', icon: '🦴', value: 'joint pain' },
]

// Triage questions flow
const TRIAGE_QUESTIONS = [
  { id: 'symptoms', question: 'What symptoms are you experiencing?', type: 'open' },
  { id: 'duration', question: 'How long have you had these symptoms?', type: 'choice', options: ['Just started', '1-3 days', '4-7 days', 'More than a week'] },
  { id: 'severity', question: 'How severe is the discomfort on a scale of 1-10?', type: 'scale' },
  { id: 'medications', question: 'Are you currently taking any medications?', type: 'choice', options: ['No medications', 'Yes, for this issue', 'Yes, for other conditions'] },
  { id: 'allergies', question: 'Do you have any known allergies?', type: 'open' },
  { id: 'additional', question: 'Anything else the doctor should know?', type: 'open' },
]

interface Message {
  id: string
  type: 'bot' | 'user'
  content: string
  timestamp: Date
  isTyping?: boolean
}

interface DoctorBrief {
  symptoms: string
  duration: string
  severity: number
  medications: string
  allergies: string
  additionalNotes: string
  suggestedSpecialty: string
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency'
}

interface AIChatTriageProps {
  onComplete: (brief: DoctorBrief) => void
  onCancel?: () => void
}

export function AIChatTriage({ onComplete, onCancel }: AIChatTriageProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [showBrief, setShowBrief] = useState(false)
  const [doctorBrief, setDoctorBrief] = useState<DoctorBrief | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize with first question
  useEffect(() => {
    const introMessage: Message = {
      id: 'intro',
      type: 'bot',
      content: "👋 Hi! I'm Sangman's AI Health Assistant. I'll ask you a few questions to help the doctor understand your condition better. This saves time during your consultation!",
      timestamp: new Date(),
    }
    
    setMessages([introMessage])
    
    // Add first question after delay
    setTimeout(() => {
      addBotMessage(TRIAGE_QUESTIONS[0].question)
    }, 1000)
  }, [])

  const addBotMessage = (content: string) => {
    // Add typing indicator
    const typingMessage: Message = {
      id: `typing-${Date.now()}`,
      type: 'bot',
      content: '',
      timestamp: new Date(),
      isTyping: true,
    }
    setMessages(prev => [...prev, typingMessage])

    // Replace with actual message after delay
    setTimeout(() => {
      setMessages(prev => [
        ...prev.filter(m => !m.isTyping),
        {
          id: `bot-${Date.now()}`,
          type: 'bot',
          content,
          timestamp: new Date(),
        }
      ])
    }, 800)
  }

  const handleSendMessage = (text: string = input) => {
    if (!text.trim()) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')

    // Store answer
    const currentQ = TRIAGE_QUESTIONS[currentQuestionIndex]
    setAnswers(prev => ({ ...prev, [currentQ.id]: text }))

    // Move to next question or complete
    if (currentQuestionIndex < TRIAGE_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setTimeout(() => {
        addBotMessage(TRIAGE_QUESTIONS[currentQuestionIndex + 1].question)
      }, 500)
    } else {
      // Generate doctor brief
      generateDoctorBrief({ ...answers, [currentQ.id]: text })
    }
  }

  const handleChipSelect = (value: string) => {
    handleSendMessage(value)
  }

  const generateDoctorBrief = async (allAnswers: Record<string, string>) => {
    setIsProcessing(true)
    addBotMessage("Thanks! I'm preparing a summary for your doctor...")

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Determine urgency and specialty
    const urgency = determineUrgency(allAnswers)
    const specialty = suggestSpecialty(allAnswers.symptoms)

    const brief: DoctorBrief = {
      symptoms: allAnswers.symptoms,
      duration: allAnswers.duration,
      severity: parseInt(allAnswers.severity) || 5,
      medications: allAnswers.medications,
      allergies: allAnswers.allergies || 'None reported',
      additionalNotes: allAnswers.additional || 'None',
      suggestedSpecialty: specialty,
      urgencyLevel: urgency,
    }

    setDoctorBrief(brief)
    setIsProcessing(false)
    setShowBrief(true)

    addBotMessage(`✅ Your health summary is ready! Based on your symptoms, I recommend consulting a **${specialty}**. ${
      urgency === 'high' || urgency === 'emergency' 
        ? '⚠️ Please seek medical attention soon.' 
        : ''
    }`)
  }

  const determineUrgency = (answers: Record<string, string>): DoctorBrief['urgencyLevel'] => {
    const severity = parseInt(answers.severity) || 5
    const symptoms = answers.symptoms?.toLowerCase() || ''
    
    if (symptoms.includes('breathing') || symptoms.includes('chest pain') || severity >= 9) {
      return 'emergency'
    }
    if (severity >= 7 || answers.duration?.includes('week')) {
      return 'high'
    }
    if (severity >= 4) {
      return 'medium'
    }
    return 'low'
  }

  const suggestSpecialty = (symptoms: string): string => {
    const s = symptoms?.toLowerCase() || ''
    
    if (s.includes('fever') || s.includes('cold') || s.includes('cough')) return 'General Physician'
    if (s.includes('skin') || s.includes('rash')) return 'Dermatologist'
    if (s.includes('stomach') || s.includes('digestion')) return 'Gastroenterologist'
    if (s.includes('joint') || s.includes('bone')) return 'Orthopedic'
    if (s.includes('head') || s.includes('migraine')) return 'Neurologist'
    if (s.includes('heart') || s.includes('chest')) return 'Cardiologist'
    if (s.includes('child') || s.includes('baby')) return 'Pediatrician'
    
    return 'General Physician'
  }

  const handleProceed = () => {
    if (doctorBrief) {
      onComplete(doctorBrief)
    }
  }

  const handleRestart = () => {
    setMessages([])
    setCurrentQuestionIndex(0)
    setAnswers({})
    setShowBrief(false)
    setDoctorBrief(null)
    
    setTimeout(() => {
      const introMessage: Message = {
        id: 'intro',
        type: 'bot',
        content: "Let's start fresh. What symptoms are you experiencing?",
        timestamp: new Date(),
      }
      setMessages([introMessage])
    }, 300)
  }

  const currentQuestion = TRIAGE_QUESTIONS[currentQuestionIndex]

  return (
    <div className="flex flex-col h-[600px] max-h-[80vh] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-emerald-500 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">AI Health Assistant</h3>
            <p className="text-white/70 text-xs">Pre-consultation triage</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRestart}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            title="Start over"
          >
            <RefreshCw className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-sky-500' 
                    : 'bg-gradient-to-br from-emerald-400 to-sky-400'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className={`rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-sky-500 text-white rounded-tr-none'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-tl-none'
                }`}>
                  {message.isTyping ? (
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Symptom Chips - Show only for first question */}
      {currentQuestionIndex === 0 && !showBrief && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick select:</p>
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_CHIPS.map((chip) => (
              <button
                key={chip.value}
                onClick={() => handleChipSelect(chip.value)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-full text-sm transition-colors"
              >
                <span>{chip.icon}</span>
                <span className="text-gray-700 dark:text-gray-300">{chip.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Severity Scale - Show for severity question */}
      {currentQuestion?.type === 'scale' && !showBrief && (
        <div className="px-4 pb-2">
          <div className="flex justify-between gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                key={num}
                onClick={() => handleSendMessage(num.toString())}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  num <= 3 
                    ? 'bg-green-100 hover:bg-green-200 text-green-700'
                    : num <= 6 
                      ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                      : num <= 8 
                        ? 'bg-orange-100 hover:bg-orange-200 text-orange-700'
                        : 'bg-red-100 hover:bg-red-200 text-red-700'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Mild</span>
            <span>Moderate</span>
            <span>Severe</span>
          </div>
        </div>
      )}

      {/* Choice Options */}
      {currentQuestion?.type === 'choice' && !showBrief && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {currentQuestion.options?.map((option) => (
              <button
                key={option}
                onClick={() => handleSendMessage(option)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Doctor Brief Card */}
      {showBrief && doctorBrief && (
        <div className="px-4 pb-2">
          <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h4 className="font-semibold text-emerald-800 dark:text-emerald-300">Doctor Brief Ready</h4>
            </div>
            <div className="space-y-2 text-sm">
              <p><b>Symptoms:</b> {doctorBrief.symptoms}</p>
              <p><b>Duration:</b> {doctorBrief.duration}</p>
              <p><b>Severity:</b> {doctorBrief.severity}/10</p>
              <p><b>Recommended:</b> {doctorBrief.suggestedSpecialty}</p>
            </div>
            <button
              onClick={handleProceed}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              Find {doctorBrief.suggestedSpecialty}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      {!showBrief && (
        <div className="p-4 border-t border-gray-100 dark:border-slate-700">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isProcessing}
              className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isProcessing}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

// Compact trigger button
export function TriageChatButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
    >
      <Bot className="w-5 h-5" />
      <span>AI Symptom Check</span>
    </button>
  )
}

