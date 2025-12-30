'use client'

import { useState, useEffect } from 'react'
import { 
  Pill, Plus, Check, Clock, Wallet, Trophy, Flame, 
  Calendar, Bell, ChevronRight, Loader2, Star, Gift
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/lib/store/authStore'

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  times: string[]
  startDate: string
  endDate?: string
  instructions?: string
}

interface DoseLog {
  medicationId: string
  scheduledTime: string
  takenAt: string | null
  date: string
}

// Mock medications
const initialMedications: Medication[] = [
  { id: '1', name: 'Vitamin D3', dosage: '60000 IU', frequency: 'Weekly', times: ['09:00'], startDate: '2024-01-01', instructions: 'Take with fatty meal' },
  { id: '2', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', times: ['08:00', '20:00'], startDate: '2024-01-01', instructions: 'After meals' },
  { id: '3', name: 'Omeprazole', dosage: '20mg', frequency: 'Once daily', times: ['07:00'], startDate: '2024-01-01', instructions: 'Before breakfast' },
]

export default function MedicationsPage() {
  const { user } = useAuthStore()
  const [medications, setMedications] = useState<Medication[]>(initialMedications)
  const [wallet, setWallet] = useState({ balance: 0, totalEarned: 0, streak: 0, todayEarned: 0 })
  const [punctualityScore, setPunctualityScore] = useState(0)
  const [discounts, setDiscounts] = useState({ punctuality: 0, streak: 0, total: 0 })
  const [todayDoses, setTodayDoses] = useState<DoseLog[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [processingDose, setProcessingDose] = useState<string | null>(null)

  // Fetch wallet data
  useEffect(() => {
    const fetchWalletData = async () => {
      if (!user?.id) return
      
      try {
        const response = await fetch(`/api/wallet/reward?userId=${user.id}`)
        const result = await response.json()
        
        if (result.success && result.data) {
          setWallet(result.data.wallet)
          setPunctualityScore(result.data.punctualityScore)
          setDiscounts(result.data.discounts)
        }
      } catch (error) {
        console.error('Failed to fetch wallet:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWalletData()

    // Initialize today's doses
    const today = new Date().toISOString().split('T')[0]
    const doses: DoseLog[] = []
    medications.forEach(med => {
      med.times.forEach(time => {
        doses.push({
          medicationId: med.id,
          scheduledTime: `${today}T${time}:00`,
          takenAt: null,
          date: today,
        })
      })
    })
    setTodayDoses(doses)
  }, [user?.id, medications])

  const handleMarkTaken = async (medicationId: string, scheduledTime: string) => {
    if (!user?.id) return
    
    const medication = medications.find(m => m.id === medicationId)
    if (!medication) return

    setProcessingDose(medicationId + scheduledTime)
    
    try {
      const response = await fetch('/api/wallet/reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          medicineName: medication.name,
          scheduledTime,
          markedAt: new Date().toISOString(),
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Update local state
        setTodayDoses(prev => prev.map(dose => 
          dose.medicationId === medicationId && dose.scheduledTime === scheduledTime
            ? { ...dose, takenAt: new Date().toISOString() }
            : dose
        ))
        
        setWallet(prev => ({
          ...prev,
          balance: result.data.balance,
          totalEarned: result.data.totalEarned,
          streak: result.data.streak,
          todayEarned: result.data.todayEarned,
        }))

        toast.success(
          <div className="flex items-center gap-2">
            <span>+₹{result.data.reward}</span>
            {result.data.onTime && <span className="text-xs bg-green-100 text-green-700 px-1 rounded">ON TIME</span>}
          </div>
        )
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to log dose')
    } finally {
      setProcessingDose(null)
    }
  }

  const getDoseStatus = (scheduledTime: string, takenAt: string | null) => {
    if (takenAt) return 'taken'
    
    const scheduled = new Date(scheduledTime)
    const now = new Date()
    
    if (now < scheduled) return 'upcoming'
    if (now.getTime() - scheduled.getTime() < 30 * 60 * 1000) return 'due' // Within 30 mins
    return 'missed'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-8 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Pill Wallet</h1>
                <p className="text-white/80">Track meds, earn rewards</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Wallet Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/70 text-sm">Sangman Health Wallet</p>
                <p className="text-4xl font-bold">₹{wallet.balance.toFixed(2)}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <Wallet className="w-8 h-8" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-amber-300">
                  <Flame className="w-4 h-4" />
                  <span className="font-bold">{wallet.streak}</span>
                </div>
                <p className="text-xs text-white/60">Day Streak</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-emerald-300">₹{wallet.todayEarned}/5</p>
                <p className="text-xs text-white/60">Today</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-sky-300">₹{wallet.totalEarned.toFixed(2)}</p>
                <p className="text-xs text-white/60">Total Earned</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Punctuality Score & Discounts */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Sangman Discount
            </h2>
            <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-bold">
              {discounts.total}% OFF
            </span>
          </div>

          <div className="space-y-4">
            {/* Punctuality Bar */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Punctuality Score</span>
                <span className="font-medium text-purple-600">{punctualityScore}% → {discounts.punctuality}% discount</span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${punctualityScore}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                />
              </div>
            </div>

            {/* Streak Bonus */}
            <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <span className="text-amber-800 dark:text-amber-300">Streak Bonus</span>
              </div>
              <span className="font-bold text-amber-600">+{discounts.streak}%</span>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Take medicines on time to increase your punctuality score and unlock up to 15% discount on Sangman orders!
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 
          rounded-2xl p-6 mb-6 border border-purple-100 dark:border-purple-800">
          <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5" />
            How to Earn
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center text-xs font-bold text-purple-600">₹1</div>
              <span className="text-sm text-purple-800 dark:text-purple-200">Per dose taken</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-800 rounded-full flex items-center justify-center text-xs font-bold text-emerald-600">+₹0.5</div>
              <span className="text-sm text-purple-800 dark:text-purple-200">On-time bonus</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center text-xs font-bold text-amber-600">₹5</div>
              <span className="text-sm text-purple-800 dark:text-purple-200">Weekly streak bonus</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-pink-100 dark:bg-pink-800 rounded-full flex items-center justify-center text-xs font-bold text-pink-600">₹5</div>
              <span className="text-sm text-purple-800 dark:text-purple-200">Max per day</span>
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-500" />
          Today's Schedule
        </h2>

        <div className="space-y-4">
          {medications.map((medication) => {
            const medDoses = todayDoses.filter(d => d.medicationId === medication.id)
            
            return (
              <div
                key={medication.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{medication.name}</h3>
                    <p className="text-sm text-gray-500">{medication.dosage} • {medication.frequency}</p>
                    {medication.instructions && (
                      <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                        💡 {medication.instructions}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {medDoses.map((dose) => {
                    const status = getDoseStatus(dose.scheduledTime, dose.takenAt)
                    const time = new Date(dose.scheduledTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })

                    return (
                      <div
                        key={dose.scheduledTime}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          status === 'taken'
                            ? 'bg-emerald-50 dark:bg-emerald-900/20'
                            : status === 'due'
                              ? 'bg-amber-50 dark:bg-amber-900/20'
                              : status === 'missed'
                                ? 'bg-red-50 dark:bg-red-900/20'
                                : 'bg-gray-50 dark:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Clock className={`w-5 h-5 ${
                            status === 'taken' ? 'text-emerald-500' :
                            status === 'due' ? 'text-amber-500' :
                            status === 'missed' ? 'text-red-500' :
                            'text-gray-400'
                          }`} />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{time}</p>
                            <p className={`text-xs ${
                              status === 'taken' ? 'text-emerald-600' :
                              status === 'due' ? 'text-amber-600' :
                              status === 'missed' ? 'text-red-600' :
                              'text-gray-400'
                            }`}>
                              {status === 'taken' ? 'Taken ✓' :
                               status === 'due' ? 'Due now!' :
                               status === 'missed' ? 'Missed' :
                               'Upcoming'}
                            </p>
                          </div>
                        </div>

                        {status !== 'taken' && status !== 'upcoming' && (
                          <button
                            onClick={() => handleMarkTaken(medication.id, dose.scheduledTime)}
                            disabled={processingDose === medication.id + dose.scheduledTime}
                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                              status === 'due'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {processingDose === medication.id + dose.scheduledTime ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            Mark Taken
                          </button>
                        )}

                        {status === 'taken' && (
                          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium flex items-center gap-1">
                            <Check className="w-4 h-4" />
                            Done
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

