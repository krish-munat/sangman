'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface TriageSummary {
  chiefComplaint: string
  duration: string
  severity: 'mild' | 'moderate' | 'severe'
  urgency: 'routine' | 'soon' | 'urgent' | 'emergency'
  suggestedSpecialty: string
  doctorBrief: string
  recommendations: string[]
}

interface ChatTriageProps {
  initialSymptom?: string
  onComplete?: (summary: TriageSummary) => void
  onBookDoctor?: (specialty: string) => void
}

const TRIAGE_QUESTIONS = [
  { key: 'symptom', question: 'What symptoms are you experiencing today?', type: 'open' },
  { key: 'duration', question: 'How long have you been experiencing this?', options: ['Just today', '2-3 days', 'About a week', 'More than a week', 'Recurring issue'] },
  { key: 'severity', question: 'On a scale of 1-10, how severe is your discomfort?', options: ['1-3 (Mild)', '4-6 (Moderate)', '7-8 (Severe)', '9-10 (Very Severe)'] },
  { key: 'associated', question: 'Are you experiencing any other symptoms?', type: 'open' },
  { key: 'medications', question: 'Are you currently taking any medications?', options: ['Yes', 'No'] },
]

export default function ChatTriage({
  initialSymptom,
  onComplete,
  onBookDoctor,
}: ChatTriageProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [currentStep, setCurrentStep] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [summary, setSummary] = useState<TriageSummary | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize with greeting
  useEffect(() => {
    const greeting: Message = {
      id: 'greeting',
      role: 'assistant',
      content: initialSymptom
        ? `I understand you're experiencing ${initialSymptom}. Let me ask you a few questions to better understand your condition.`
        : "Hi! I'm Sangman's AI Health Assistant. I'll help assess your symptoms before connecting you with the right doctor. Let's start - what symptoms are you experiencing today?",
      timestamp: new Date(),
    }
    setMessages([greeting])
    
    if (initialSymptom) {
      // Skip first question if symptom provided
      setTimeout(() => askQuestion(1), 1000)
    }
  }, [initialSymptom])

  const askQuestion = (stepIndex: number) => {
    if (stepIndex >= TRIAGE_QUESTIONS.length) {
      // All questions answered, analyze
      analyzeSymptoms()
      return
    }

    setIsTyping(true)
    setTimeout(() => {
      const question = TRIAGE_QUESTIONS[stepIndex]
      const botMessage: Message = {
        id: `bot-${stepIndex}`,
        role: 'assistant',
        content: question.question,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
      setCurrentStep(stepIndex)
      setIsTyping(false)
    }, 800)
  }

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')

    // Move to next question
    setTimeout(() => askQuestion(currentStep + 1), 500)
  }

  const handleOptionSelect = (option: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: option,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    // Move to next question
    setTimeout(() => askQuestion(currentStep + 1), 500)
  }

  const analyzeSymptoms = async () => {
    setIsAnalyzing(true)
    
    const analysisMessage: Message = {
      id: 'analyzing',
      role: 'assistant',
      content: 'Thank you for the information. Let me analyze your symptoms...',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, analysisMessage])

    try {
      const response = await fetch('/api/triage/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      })

      const result = await response.json()

      if (result.success) {
        const triageSummary = result.data as TriageSummary
        setSummary(triageSummary)

        const summaryMessage: Message = {
          id: 'summary',
          role: 'assistant',
          content: `Based on your symptoms, here's my assessment:

**Chief Complaint:** ${triageSummary.chiefComplaint}
**Duration:** ${triageSummary.duration}
**Severity:** ${triageSummary.severity.charAt(0).toUpperCase() + triageSummary.severity.slice(1)}
**Urgency:** ${triageSummary.urgency.charAt(0).toUpperCase() + triageSummary.urgency.slice(1)}

I recommend consulting a **${triageSummary.suggestedSpecialty}**.

Would you like me to show you available doctors?`,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, summaryMessage])
        onComplete?.(triageSummary)
      }
    } catch (error) {
      console.error('Triage analysis error:', error)
      const errorMessage: Message = {
        id: 'error',
        role: 'assistant',
        content: "I apologize, but I couldn't complete the analysis. Please try again or speak directly with a doctor.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsAnalyzing(false)
    }
  }

  const currentQuestion = TRIAGE_QUESTIONS[currentStep]

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white">AI Symptom Assessment</h3>
          <p className="text-white/70 text-sm">Powered by Sangman AI</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-sky-100 dark:bg-sky-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-sky-500 text-white rounded-br-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md'
                }`}
              >
                <p className="whitespace-pre-line text-sm">{message.content}</p>
              </div>
              
              {message.role === 'user' && (
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-sky-600" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Options */}
      {currentQuestion?.options && !summary && !isAnalyzing && (
        <div className="px-4 py-2 border-t dark:border-gray-800">
          <div className="flex flex-wrap gap-2">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                onClick={() => handleOptionSelect(option)}
                className="px-4 py-2 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 
                  rounded-full text-sm font-medium hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Summary Actions */}
      {summary && (
        <div className="px-4 py-3 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex gap-2">
            <button
              onClick={() => onBookDoctor?.(summary.suggestedSpecialty)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r 
                from-sky-500 to-blue-600 text-white rounded-xl font-semibold hover:from-sky-600 
                hover:to-blue-700 transition-all"
            >
              <span>Find {summary.suggestedSpecialty}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          {/* Urgency indicator */}
          <div className={`mt-3 flex items-center gap-2 text-sm ${
            summary.urgency === 'emergency' || summary.urgency === 'urgent'
              ? 'text-red-600'
              : summary.urgency === 'soon'
                ? 'text-amber-600'
                : 'text-green-600'
          }`}>
            {summary.urgency === 'emergency' || summary.urgency === 'urgent' ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            <span>
              {summary.urgency === 'emergency' 
                ? 'Seek immediate medical attention'
                : summary.urgency === 'urgent'
                  ? 'Consult a doctor within 24 hours'
                  : summary.urgency === 'soon'
                    ? 'Schedule an appointment this week'
                    : 'Routine consultation recommended'}
            </span>
          </div>
        </div>
      )}

      {/* Input */}
      {!summary && (
        <div className="p-4 border-t dark:border-gray-800">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your response..."
              disabled={isAnalyzing}
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl border-none 
                focus:ring-2 focus:ring-sky-500 outline-none text-gray-800 dark:text-gray-200
                disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isAnalyzing}
              className="p-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors 
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
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

