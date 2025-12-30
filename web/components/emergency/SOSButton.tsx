'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, X, MapPin, AlertTriangle, Navigation, Loader2 } from 'lucide-react'
import { useLocationStore } from '@/lib/store/locationStore'

interface EmergencyHospital {
  id: string
  name: string
  distance: string
  address: string
  phone: string
  coordinates: { lat: number; lng: number }
  isOpen: boolean
  waitTime?: string
}

// Mock nearby hospitals - In production, fetch from Google Places API
const MOCK_HOSPITALS: EmergencyHospital[] = [
  {
    id: 'h1',
    name: 'Apollo Emergency',
    distance: '0.8 km',
    address: 'MG Road, Near City Mall',
    phone: '+91-731-4000000',
    coordinates: { lat: 22.7196, lng: 75.8577 },
    isOpen: true,
    waitTime: '~10 min',
  },
  {
    id: 'h2',
    name: 'Medanta Hospital',
    distance: '1.2 km',
    address: 'Vijay Nagar, Main Road',
    phone: '+91-731-4100000',
    coordinates: { lat: 22.7250, lng: 75.8820 },
    isOpen: true,
    waitTime: '~15 min',
  },
  {
    id: 'h3',
    name: 'City Hospital 24x7',
    distance: '2.1 km',
    address: 'Regal Square, AB Road',
    phone: '+91-731-2551234',
    coordinates: { lat: 22.7100, lng: 75.8600 },
    isOpen: true,
    waitTime: '~5 min',
  },
]

export function SOSButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hospitals, setHospitals] = useState<EmergencyHospital[]>([])
  const { coordinates, fetchLocation } = useLocationStore()

  const handleSOS = async () => {
    setIsOpen(true)
    setIsLoading(true)

    // Get user location
    if (!coordinates) {
      await fetchLocation()
    }

    // Simulate fetching nearby hospitals
    await new Promise(resolve => setTimeout(resolve, 1000))
    setHospitals(MOCK_HOSPITALS)
    setIsLoading(false)
  }

  const openGoogleMaps = (hospital: EmergencyHospital) => {
    const { lat, lng } = hospital.coordinates
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
    window.open(url, '_blank')
  }

  const callHospital = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  return (
    <>
      {/* Floating SOS Button */}
      <motion.button
        onClick={handleSOS}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-2xl flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(239, 68, 68, 0.4)',
            '0 0 0 20px rgba(239, 68, 68, 0)',
          ],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: 'loop',
        }}
      >
        <div className="flex flex-col items-center">
          <AlertTriangle className="w-6 h-6" />
          <span className="text-[10px] font-bold">SOS</span>
        </div>
      </motion.button>

      {/* Emergency Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-5 relative">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Emergency Help</h2>
                    <p className="text-white/80 text-sm">Nearest hospitals with directions</p>
                  </div>
                </div>
              </div>

              {/* Emergency Numbers */}
              <div className="p-4 bg-red-50 dark:bg-red-900/30 border-b border-red-100 dark:border-red-800">
                <div className="flex gap-3">
                  <a
                    href="tel:112"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Call 112</span>
                  </a>
                  <a
                    href="tel:108"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 rounded-xl font-semibold border-2 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Ambulance 108</span>
                  </a>
                </div>
              </div>

              {/* Hospital List */}
              <div className="p-4 overflow-y-auto max-h-[50vh]">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Nearby Hospitals
                </h3>

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-red-500 animate-spin mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">Finding nearest hospitals...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {hospitals.map((hospital) => (
                      <div
                        key={hospital.id}
                        className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {hospital.name}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {hospital.address}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-red-600 dark:text-red-400">
                              {hospital.distance}
                            </span>
                            {hospital.waitTime && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {hospital.waitTime} wait
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => openGoogleMaps(hospital)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                          >
                            <Navigation className="w-4 h-4" />
                            Navigate
                          </button>
                          <button
                            onClick={() => callHospital(hospital.phone)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                            Call
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Note */}
              <div className="p-4 bg-gray-50 dark:bg-slate-700/50 border-t border-gray-100 dark:border-slate-600">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  ⚠️ For life-threatening emergencies, please call <b>112</b> immediately.
                  Sangman can help locate the nearest hospital but cannot dispatch emergency services.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Inline emergency banner for pages
export function EmergencyBanner() {
  return (
    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h4 className="font-semibold text-red-800 dark:text-red-300">Need Emergency Help?</h4>
          <p className="text-sm text-red-600 dark:text-red-400">Find nearest hospitals instantly</p>
        </div>
      </div>
      <a
        href="tel:112"
        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
      >
        <Phone className="w-4 h-4" />
        <span>Call 112</span>
      </a>
    </div>
  )
}

