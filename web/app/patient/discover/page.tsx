'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Search, MapPin, Star, Clock, AlertCircle, Navigation, Loader2, Mic } from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import { VoiceSearchInline } from '@/components/search/VoiceSearchButton'
import type { Doctor } from '../../../../shared/types'
import { SPECIALIZATIONS } from '../../../../shared/constants'
import { formatCurrency, formatLocationDistance } from '@/lib/utils/format'
import toast from 'react-hot-toast'

// Dynamic import for Leaflet map - prevents SSR issues with window
const DoctorMap = dynamic(() => import('@/components/map/DoctorMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded-lg">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-2" />
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Loading map...</p>
      </div>
    </div>
  ),
})

export default function DiscoverPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('')
  const [showEmergencyOnly, setShowEmergencyOnly] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Request location permission with error handling
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          try {
            if (position?.coords?.latitude && position?.coords?.longitude) {
              setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              })
            }
          } catch (error) {
            console.error('Error setting location:', error)
          }
        },
        (error) => {
          console.error('Error getting location:', error)
          // Handle different geolocation errors
          let errorMessage = 'Could not access your location'
          if (error) {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Location access denied. Please enable location permissions.'
                break
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information unavailable.'
                break
              case error.TIMEOUT:
                errorMessage = 'Location request timed out.'
                break
            }
          }
          toast.error(errorMessage)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )
    } else if (typeof window !== 'undefined') {
      // Only show error if we're in browser
      console.warn('Geolocation is not supported by your browser')
    }

    // Mock doctors data - works without backend
    const mockDoctors: Doctor[] = [
      {
        id: '1',
        email: 'dr.sharma@example.com',
        phone: '+919876543210',
        role: 'doctor',
        name: 'Dr. Rajesh Sharma',
        specializations: ['Cardiology', 'General Medicine'],
        experience: 15,
        qualifications: ['MBBS', 'MD Cardiology'],
        clinicAddress: {
          street: '123 Medical Street',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001',
          coordinates: { latitude: 28.6139, longitude: 77.2090 },
        },
        consultationFee: 500,
        emergencyFee: 1000,
        availability: {
          days: {},
          timezone: 'Asia/Kolkata',
        },
        emergencyAvailable: true,
        verified: true,
        verificationStatus: 'approved',
        rating: 4.8,
        totalReviews: 120,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        email: 'dr.patel@example.com',
        phone: '+919876543211',
        role: 'doctor',
        name: 'Dr. Anita Patel',
        specializations: ['Pediatrics'],
        experience: 10,
        qualifications: ['MBBS', 'MD Pediatrics'],
        clinicAddress: {
          street: '456 Health Avenue',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          coordinates: { latitude: 19.076, longitude: 72.8777 },
        },
        consultationFee: 600,
        emergencyFee: 1200,
        availability: {
          days: {},
          timezone: 'Asia/Kolkata',
        },
        emergencyAvailable: false,
        verified: true,
        verificationStatus: 'approved',
        rating: 4.9,
        totalReviews: 85,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        email: 'dr.singh@example.com',
        phone: '+919876543212',
        role: 'doctor',
        name: 'Dr. Vikram Singh',
        specializations: ['Orthopedics'],
        experience: 20,
        qualifications: ['MBBS', 'MS Orthopedics'],
        clinicAddress: {
          street: '789 Care Center',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          coordinates: { latitude: 12.9716, longitude: 77.5946 },
        },
        consultationFee: 800,
        emergencyFee: 1600,
        availability: {
          days: {},
          timezone: 'Asia/Kolkata',
        },
        emergencyAvailable: true,
        verified: true,
        verificationStatus: 'approved',
        rating: 4.7,
        totalReviews: 200,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
    setDoctors(mockDoctors)
    setFilteredDoctors(mockDoctors)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    let filtered = doctors

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doctor.specializations.some((spec) =>
            spec.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    }

    // Filter by specialty
    if (selectedSpecialty) {
      filtered = filtered.filter((doctor) =>
        doctor.specializations.includes(selectedSpecialty)
      )
    }

    // Filter by emergency availability
    if (showEmergencyOnly) {
      filtered = filtered.filter((doctor) => doctor.emergencyAvailable)
    }

    setFilteredDoctors(filtered)
  }, [searchQuery, selectedSpecialty, showEmergencyOnly, doctors])

  const handleBookAppointment = (doctor: Doctor) => {
    try {
      if (!doctor?.id) {
        toast.error('Invalid doctor selected')
        return
      }
      router.push(`/patient/booking?doctorId=${doctor.id}`)
    } catch (error) {
      console.error('Error booking appointment:', error)
      toast.error('Failed to open booking page')
    }
  }

  const calculateDistance = (doctor: Doctor): number | null => {
    try {
      if (!userLocation || !doctor?.clinicAddress?.coordinates) return null
      const R = 6371e3
      const φ1 = (userLocation.lat * Math.PI) / 180
      const φ2 = (doctor.clinicAddress.coordinates.latitude * Math.PI) / 180
      const Δφ = ((doctor.clinicAddress.coordinates.latitude - userLocation.lat) * Math.PI) / 180
      const Δλ =
        ((doctor.clinicAddress.coordinates.longitude - userLocation.lng) * Math.PI) / 180

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

      return R * c
    } catch (error) {
      console.error('Error calculating distance:', error)
      return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400">Finding doctors near you...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Find Doctors
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                {viewMode === 'list' ? (
                  <>
                    <MapPin className="w-4 h-4" />
                    <span className="hidden sm:inline">Map View</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4" />
                    <span className="hidden sm:inline">List View</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Search Bar with Voice Search */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500" />
              <input
                type="text"
                placeholder="Search by name or specialty... or tap mic to speak"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 py-3 pl-12 pr-4 text-sm bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
            {/* Voice Search Button */}
            <button
              onClick={() => {
                // Voice search is handled by VoiceSearchButton component
                // This is a visual indicator that voice search is available
              }}
              className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 text-white hover:opacity-90 transition-opacity shadow-lg"
              title="Voice Search - Speak in Hindi, English, or Marathi"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
          
          {/* Voice Search Tip */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-1">
            <Mic className="w-3 h-3" />
            Try saying: "दिल का डॉक्टर" or "Cardiologist near me"
          </p>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Specialties</option>
              {SPECIALIZATIONS.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowEmergencyOnly(!showEmergencyOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showEmergencyOnly
                  ? 'bg-emergency-500 text-white'
                  : 'border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              <span>Emergency Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {viewMode === 'list' ? (
          <div className="grid gap-4">
            {filteredDoctors.length === 0 ? (
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-12 text-center border border-neutral-200 dark:border-neutral-700">
                <Search className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  No doctors found
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Try adjusting your search or filters to find doctors.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedSpecialty('')
                    setShowEmergencyOnly(false)
                  }}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredDoctors.map((doctor) => {
                const distance = calculateDistance(doctor)
                return (
                  <div
                    key={doctor.id}
                    id={`doctor-${doctor.id}`}
                    className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                              {doctor.name}
                            </h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                              {doctor.specializations.join(', ')}
                            </p>
                          </div>
                          {doctor.emergencyAvailable && (
                            <span className="px-2 py-1 bg-emergency-100 dark:bg-emergency-900 text-emergency-700 dark:text-emergency-300 text-xs font-medium rounded">
                              Emergency Available
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{doctor.rating}</span>
                            <span>({doctor.totalReviews} reviews)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{doctor.experience} years exp.</span>
                          </div>
                          {distance !== null && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{formatLocationDistance(distance)}</span>
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                          📍 {doctor.clinicAddress.street}, {doctor.clinicAddress.city},{' '}
                          {doctor.clinicAddress.state}
                        </p>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-bold text-primary-500">
                              {formatCurrency(doctor.consultationFee)}
                            </span>
                            <span className="text-sm text-neutral-500">
                              /consultation
                            </span>
                          </div>
                          <button
                            onClick={() => handleBookAppointment(doctor)}
                            className="px-6 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                          >
                            Book Appointment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        ) : (
          <div className="h-[calc(100vh-300px)] min-h-[400px] rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
            <DoctorMap
              doctors={filteredDoctors}
              userLocation={userLocation || undefined}
              onDoctorSelect={(doctor) => {
                setSelectedDoctor(doctor)
                setViewMode('list')
                // Scroll to doctor card
                setTimeout(() => {
                  document.getElementById(`doctor-${doctor.id}`)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                  })
                }, 100)
              }}
              selectedDoctorId={selectedDoctor?.id}
            />
          </div>
        )}
      </div>
    </div>
  )
}
