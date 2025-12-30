'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, ArrowRight } from 'lucide-react'

// Body parts with their symptoms
const BODY_PARTS = {
  head: {
    label: 'Head',
    position: { top: '5%', left: '50%' },
    symptoms: ['Headache', 'Migraine', 'Dizziness', 'Hair loss', 'Scalp issues'],
  },
  eyes: {
    label: 'Eyes',
    position: { top: '12%', left: '50%' },
    symptoms: ['Blurred vision', 'Eye pain', 'Redness', 'Itching', 'Watery eyes'],
  },
  ears: {
    label: 'Ears',
    position: { top: '14%', left: '38%' },
    symptoms: ['Ear pain', 'Hearing loss', 'Ringing', 'Discharge', 'Blocked ear'],
  },
  nose: {
    label: 'Nose & Throat',
    position: { top: '18%', left: '50%' },
    symptoms: ['Runny nose', 'Sore throat', 'Congestion', 'Sneezing', 'Loss of smell'],
  },
  chest: {
    label: 'Chest',
    position: { top: '32%', left: '50%' },
    symptoms: ['Chest pain', 'Shortness of breath', 'Cough', 'Palpitations', 'Wheezing'],
  },
  stomach: {
    label: 'Stomach',
    position: { top: '45%', left: '50%' },
    symptoms: ['Stomach ache', 'Nausea', 'Bloating', 'Acidity', 'Vomiting'],
  },
  back: {
    label: 'Back',
    position: { top: '40%', left: '70%' },
    symptoms: ['Lower back pain', 'Upper back pain', 'Stiffness', 'Muscle spasm', 'Sciatica'],
  },
  arms: {
    label: 'Arms & Hands',
    position: { top: '42%', left: '25%' },
    symptoms: ['Arm pain', 'Numbness', 'Weakness', 'Swelling', 'Joint pain'],
  },
  legs: {
    label: 'Legs & Feet',
    position: { top: '70%', left: '50%' },
    symptoms: ['Leg pain', 'Knee pain', 'Swelling', 'Cramps', 'Numbness'],
  },
  skin: {
    label: 'Skin (General)',
    position: { top: '55%', left: '30%' },
    symptoms: ['Rash', 'Itching', 'Acne', 'Dryness', 'Discoloration'],
  },
}

type BodyPartKey = keyof typeof BODY_PARTS

interface BodySymptomSelectorProps {
  onComplete: (selectedSymptoms: { bodyPart: string; symptoms: string[] }[]) => void
  onCancel?: () => void
}

export function BodySymptomSelector({ onComplete, onCancel }: BodySymptomSelectorProps) {
  const [selectedPart, setSelectedPart] = useState<BodyPartKey | null>(null)
  const [selectedSymptoms, setSelectedSymptoms] = useState<Record<BodyPartKey, string[]>>({} as any)

  const handlePartClick = (part: BodyPartKey) => {
    setSelectedPart(part)
  }

  const handleSymptomToggle = (symptom: string) => {
    if (!selectedPart) return

    setSelectedSymptoms(prev => {
      const current = prev[selectedPart] || []
      const updated = current.includes(symptom)
        ? current.filter(s => s !== symptom)
        : [...current, symptom]
      
      return { ...prev, [selectedPart]: updated }
    })
  }

  const getTotalSelectedCount = () => {
    return Object.values(selectedSymptoms).reduce((sum, arr) => sum + arr.length, 0)
  }

  const handleComplete = () => {
    const result = Object.entries(selectedSymptoms)
      .filter(([, symptoms]) => symptoms.length > 0)
      .map(([bodyPart, symptoms]) => ({
        bodyPart: BODY_PARTS[bodyPart as BodyPartKey].label,
        symptoms,
      }))
    
    onComplete(result)
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-emerald-500 px-6 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold text-lg">Where does it hurt?</h3>
          <p className="text-white/80 text-sm">Tap on the body part to select symptoms</p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Body Diagram */}
        <div className="relative w-full lg:w-1/2 h-[400px] bg-gradient-to-b from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-800">
          {/* Simple Body Outline SVG */}
          <svg
            viewBox="0 0 200 400"
            className="absolute inset-0 w-full h-full p-8"
            style={{ maxHeight: '380px', margin: 'auto' }}
          >
            {/* Body outline */}
            <ellipse cx="100" cy="40" rx="30" ry="35" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2" />
            <rect x="70" y="75" width="60" height="100" rx="10" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2" />
            <rect x="30" y="80" width="40" height="80" rx="8" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2" />
            <rect x="130" y="80" width="40" height="80" rx="8" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2" />
            <rect x="75" y="175" width="22" height="120" rx="8" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2" />
            <rect x="103" y="175" width="22" height="120" rx="8" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2" />
          </svg>

          {/* Clickable Hotspots */}
          {Object.entries(BODY_PARTS).map(([key, part]) => {
            const partKey = key as BodyPartKey
            const hasSymptoms = (selectedSymptoms[partKey]?.length || 0) > 0
            const isSelected = selectedPart === partKey

            return (
              <motion.button
                key={key}
                onClick={() => handlePartClick(partKey)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-10 ${
                  isSelected 
                    ? 'scale-125' 
                    : ''
                }`}
                style={{ top: part.position.top, left: part.position.left }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  hasSymptoms
                    ? 'bg-red-500 text-white'
                    : isSelected
                      ? 'bg-sky-500 text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-600 hover:border-sky-500 hover:text-sky-500'
                }`}>
                  {hasSymptoms ? (
                    <span className="text-xs font-bold">{selectedSymptoms[partKey].length}</span>
                  ) : (
                    <span className="text-lg">•</span>
                  )}
                </div>
                <span className={`absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap font-medium ${
                  isSelected ? 'text-sky-600 dark:text-sky-400' : 'text-gray-500'
                }`}>
                  {part.label}
                </span>
              </motion.button>
            )
          })}
        </div>

        {/* Symptom Selection Panel */}
        <div className="w-full lg:w-1/2 p-6 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-slate-700">
          <AnimatePresence mode="wait">
            {selectedPart ? (
              <motion.div
                key={selectedPart}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                  {BODY_PARTS[selectedPart].label}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Select all symptoms you're experiencing:
                </p>

                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {BODY_PARTS[selectedPart].symptoms.map((symptom) => {
                    const isChecked = selectedSymptoms[selectedPart]?.includes(symptom)
                    
                    return (
                      <button
                        key={symptom}
                        onClick={() => handleSymptomToggle(symptom)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                          isChecked
                            ? 'bg-sky-100 dark:bg-sky-900/30 border-2 border-sky-500'
                            : 'bg-gray-50 dark:bg-slate-700 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-slate-600'
                        }`}
                      >
                        <span className={`font-medium ${
                          isChecked ? 'text-sky-700 dark:text-sky-300' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {symptom}
                        </span>
                        {isChecked && (
                          <Check className="w-5 h-5 text-sky-500" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center py-12"
              >
                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">👆</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  Tap on a body part to<br />select your symptoms
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-slate-700/50 border-t border-gray-100 dark:border-slate-600 flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {getTotalSelectedCount() > 0 ? (
            <span className="font-medium">{getTotalSelectedCount()} symptoms selected</span>
          ) : (
            <span>No symptoms selected yet</span>
          )}
        </div>
        <button
          onClick={handleComplete}
          disabled={getTotalSelectedCount() === 0}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Compact symptom badge display
export function SymptomBadges({ 
  symptoms 
}: { 
  symptoms: { bodyPart: string; symptoms: string[] }[] 
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {symptoms.map((group) => (
        group.symptoms.map((symptom) => (
          <span
            key={`${group.bodyPart}-${symptom}`}
            className="inline-flex items-center gap-1 px-2 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded-full text-xs"
          >
            <span className="font-medium">{group.bodyPart}:</span>
            {symptom}
          </span>
        ))
      ))}
    </div>
  )
}

