'use client'

import { useState, useEffect } from 'react'
import { MapPin, X, Loader2, Navigation, CheckCircle, AlertCircle, Shield } from 'lucide-react'
import { useLocationStore } from '@/lib/store/locationStore'
import toast from 'react-hot-toast'

interface LocationPermissionProps {
  onSuccess?: (location: any) => void
  onDismiss?: () => void
  showOnMount?: boolean
  variant?: 'modal' | 'banner' | 'button'
}

export default function LocationPermission({
  onSuccess,
  onDismiss,
  showOnMount = true,
  variant = 'modal',
}: LocationPermissionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const {
    location,
    permissionStatus,
    isSupported,
    isLoading,
    error,
    hasPrompted,
    requestLocation,
    setHasPrompted,
  } = useLocationStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Show prompt on mount if enabled and not prompted before
  useEffect(() => {
    if (mounted && showOnMount && !hasPrompted && isSupported && variant === 'modal') {
      // Small delay to let the page load
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [mounted, showOnMount, hasPrompted, isSupported, variant])

  const handleRequestLocation = async () => {
    const success = await requestLocation()
    
    if (success) {
      toast.success('Location access granted!')
      const currentLocation = useLocationStore.getState().location
      if (onSuccess && currentLocation) {
        onSuccess(currentLocation)
      }
      setIsVisible(false)
    } else {
      const currentError = useLocationStore.getState().error
      toast.error(currentError || 'Could not get location')
    }
  }

  const handleDismiss = () => {
    setHasPrompted(true)
    setIsVisible(false)
    if (onDismiss) {
      onDismiss()
    }
  }

  if (!mounted || !isSupported) return null

  // Button variant - just a button to trigger location
  if (variant === 'button') {
    return (
      <button
        onClick={handleRequestLocation}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-emerald-500 text-white rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : location ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <MapPin className="w-5 h-5" />
        )}
        {isLoading ? 'Getting location...' : location ? 'Location set' : 'Enable Location'}
      </button>
    )
  }

  // Banner variant - shows at top of page
  if (variant === 'banner' && !hasPrompted && !location) {
    return (
      <div className="bg-gradient-to-r from-sky-500 to-emerald-500 text-white px-4 py-3">
        <div className="container mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5" />
            <span className="text-sm font-medium">
              Enable location to find nearby doctors and hospitals
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRequestLocation}
              disabled={isLoading}
              className="px-4 py-1.5 bg-white text-sky-600 rounded-lg text-sm font-semibold hover:bg-sky-50 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Getting...' : 'Enable'}
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Modal variant - shows as popup
  if (variant === 'modal' && isVisible) {
    return (
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleDismiss}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* Illustration */}
          <div className="pt-8 pb-4 px-6 text-center bg-gradient-to-br from-sky-50 to-emerald-50">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-sky-500 to-emerald-500 rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-sky-500/30">
              <Navigation className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Enable Location
            </h2>
            <p className="text-gray-600 text-sm">
              Allow location access to find nearby doctors and get accurate wait times
            </p>
          </div>

          {/* Benefits */}
          <div className="px-6 py-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">Find Nearby Hospitals</p>
                <p className="text-xs text-gray-500">Discover healthcare facilities near you</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Navigation className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">Get Directions</p>
                <p className="text-xs text-gray-500">Navigate easily to your appointment</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">Your Privacy Matters</p>
                <p className="text-xs text-gray-500">Location is only used while using the app</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="p-6 space-y-3">
            <button
              onClick={handleRequestLocation}
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Getting Location...
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5" />
                  Enable Location
                </>
              )}
            </button>
            
            <button
              onClick={handleDismiss}
              className="w-full py-3 text-gray-500 font-medium hover:text-gray-700 transition-colors text-sm"
            >
              Not Now
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

// Hook to trigger location permission manually
export function useLocationPermission() {
  const { requestLocation, location, isLoading, error, isSupported } = useLocationStore()
  
  return {
    requestLocation,
    location,
    isLoading,
    error,
    isSupported,
    hasLocation: !!location,
  }
}

