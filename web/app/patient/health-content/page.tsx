'use client'

import { useState } from 'react'
import { BookOpen, Heart, Leaf, Sparkles, AlertTriangle, Droplet, Eye, Wind, Bone, Utensils, Sparkles as AyurvedaIcon, Scissors, Moon, Activity, Smile } from 'lucide-react'
import type { HealthTip } from '../../../../shared/types'
import { dadiNuskhe, type DadiNuskhe } from './dadi-nuskhe'

const healthTips: HealthTip[] = [
  {
    id: '1',
    title: 'Morning Meditation for Mental Clarity',
    content: `Start your day with 10 minutes of meditation. Sit comfortably, close your eyes, and focus on your breath. This practice helps reduce stress, improve concentration, and sets a positive tone for the day.`,
    category: 'vedic',
    disclaimer: 'This is general wellness advice and not a substitute for medical treatment.',
  },
  {
    id: '2',
    title: 'The Power of Hydration',
    content: `Drink at least 8-10 glasses of water daily. Proper hydration helps maintain body temperature, supports digestion, and keeps your skin healthy. Carry a water bottle with you to stay hydrated throughout the day.`,
    category: 'wellness',
    disclaimer: 'This is general wellness advice and not a substitute for medical treatment.',
  },
  {
    id: '3',
    title: 'Ayurvedic Daily Routine (Dinacharya)',
    content: `Follow a consistent daily routine: Wake up early (before sunrise), practice yoga or light exercise, have a nutritious breakfast, maintain regular meal times, and sleep by 10 PM. This aligns your body with natural rhythms.`,
    category: 'vedic',
    disclaimer: 'This is general wellness advice and not a substitute for medical treatment.',
  },
  {
    id: '4',
    title: 'Balanced Diet Principles',
    content: `Include a variety of fruits, vegetables, whole grains, lean proteins, and healthy fats in your diet. Eat mindfully, chew your food properly, and avoid processed foods. Remember, moderation is key.`,
    category: 'lifestyle',
    disclaimer: 'This is general wellness advice and not a substitute for medical treatment.',
  },
  {
    id: '5',
    title: 'Quality Sleep for Health',
    content: `Aim for 7-9 hours of quality sleep each night. Create a bedtime routine, keep your bedroom dark and cool, and avoid screens before bed. Good sleep is essential for physical and mental recovery.`,
    category: 'wellness',
    disclaimer: 'This is general wellness advice and not a substitute for medical treatment.',
  },
]

const categories = [
  { id: 'all', name: 'All', icon: BookOpen },
  { id: 'vedic', name: 'Vedic', icon: Heart },
  { id: 'wellness', name: 'Wellness', icon: Leaf },
  { id: 'lifestyle', name: 'Lifestyle', icon: Sparkles },
  { id: 'general', name: 'General', icon: BookOpen },
  { id: 'dadi', name: "Dadi Ke Nuskhe", icon: Heart },
]

const dadiCategories = [
  { id: 'all', name: 'All Remedies', icon: BookOpen },
  { id: 'skin', name: 'Skin Care', icon: Droplet },
  { id: 'eyes', name: 'Dark Circles', icon: Eye },
  { id: 'respiratory', name: 'Cough & Cold', icon: Wind },
  { id: 'bones', name: 'Bone Health', icon: Bone },
  { id: 'digestion', name: 'Digestion', icon: Utensils },
  { id: 'ayurvedic', name: 'Ayurvedic', icon: AyurvedaIcon },
  { id: 'hair', name: 'Hair Care', icon: Scissors },
  { id: 'stress', name: 'Stress & Sleep', icon: Moon },
  { id: 'blood', name: 'Blood Purifier', icon: Activity },
  { id: 'oral', name: 'Oral Health', icon: Smile },
]

export default function HealthContentPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDadiCategory, setSelectedDadiCategory] = useState<string>('all')
  const [showDadiNuskhe, setShowDadiNuskhe] = useState(false)

  const filteredTips =
    selectedCategory === 'all'
      ? healthTips
      : healthTips.filter((tip) => tip.category === selectedCategory)

  const filteredDadiNuskhe =
    selectedDadiCategory === 'all'
      ? dadiNuskhe
      : dadiNuskhe.filter((nuskhe) => nuskhe.category === selectedDadiCategory)

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Health & Wellness Tips
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Free health content to help you maintain a healthy lifestyle
          </p>
          
          {/* Toggle between regular tips and Dadi Ke Nuskhe */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowDadiNuskhe(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !showDadiNuskhe
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Modern Tips
            </button>
            <button
              onClick={() => setShowDadiNuskhe(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showDadiNuskhe
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Dadi Ke Nuskhe (Grandma's Remedies)
            </button>
          </div>
        </div>

        {/* Category Filter */}
        {!showDadiNuskhe ? (
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {categories.filter(c => c.id !== 'dadi').map((category) => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`icon-text-group px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{category.name}</span>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {dadiCategories.map((category) => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedDadiCategory(category.id)}
                  className={`icon-text-group px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    selectedDadiCategory === category.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{category.name}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Disclaimer */}
        <div className="card mb-6 bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-800">
          <div className="icon-text-group items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                Important Disclaimer
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                The health tips provided here are for general wellness and educational purposes
                only. They are not intended to be a substitute for professional medical advice,
                diagnosis, or treatment. Always seek the advice of your physician or other qualified
                health provider with any questions you may have regarding a medical condition.
              </p>
            </div>
          </div>
        </div>

        {/* Health Tips Grid */}
        {!showDadiNuskhe ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTips.map((tip) => (
                <div key={tip.id} className="card">
                  <div className="mb-3">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        tip.category === 'vedic'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                          : tip.category === 'wellness'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : tip.category === 'lifestyle'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {tip.category.charAt(0).toUpperCase() + tip.category.slice(1)}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                    {tip.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
                    {tip.content}
                  </p>
                  <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 italic">
                      {tip.disclaimer}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {filteredTips.length === 0 && (
              <div className="card text-center py-12">
                <BookOpen className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-600 dark:text-neutral-400">
                  No tips found in this category
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredDadiNuskhe.map((nuskhe) => (
                <div key={nuskhe.id} className="card">
                  <div className="mb-3">
                    <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                      {nuskhe.category.charAt(0).toUpperCase() + nuskhe.category.slice(1)}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                    {nuskhe.title}
                  </h3>
                  
                  <div className="mb-4 p-3 bg-primary-50 dark:bg-primary-900 rounded-lg">
                    <p className="text-sm font-medium text-primary-900 dark:text-primary-100 mb-1">
                      Philosophy:
                    </p>
                    <p className="text-sm text-primary-700 dark:text-primary-300 italic">
                      {nuskhe.philosophy}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                      Method:
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {nuskhe.method}
                    </p>
                  </div>

                  {nuskhe.ingredients && nuskhe.ingredients.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                        Ingredients:
                      </p>
                      <ul className="list-disc list-inside text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                        {nuskhe.ingredients.map((ing, idx) => (
                          <li key={idx}>{ing}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {nuskhe.timing && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                        Timing:
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {nuskhe.timing}
                      </p>
                    </div>
                  )}

                  <div className="mb-4 p-3 bg-success-50 dark:bg-success-900 rounded-lg">
                    <p className="text-sm font-medium text-success-900 dark:text-success-100 mb-1">
                      Why It Works:
                    </p>
                    <p className="text-sm text-success-700 dark:text-success-300">
                      {nuskhe.whyItWorks}
                    </p>
                  </div>

                  {nuskhe.precautions && (
                    <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                      <p className="text-xs font-medium text-yellow-700 dark:text-yellow-300 mb-1">
                        ⚠️ Precautions:
                      </p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">
                        {nuskhe.precautions}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700 mt-4">
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 italic">
                      These remedies are time-tested and preventative. For chronic conditions, persistent pain, or severe infections, always consult a medical professional.
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {filteredDadiNuskhe.length === 0 && (
              <div className="card text-center py-12">
                <Heart className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-600 dark:text-neutral-400">
                  No remedies found in this category
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

