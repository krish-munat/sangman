import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  LocationData, 
  getCurrentLocation, 
  checkLocationPermission,
  isGeolocationSupported 
} from '@/lib/utils/location'

interface LocationState {
  // Current location data
  location: LocationData | null
  
  // Convenience getters
  coordinates: { latitude: number; longitude: number } | null
  address: string | null
  
  // Permission status
  permissionStatus: PermissionState | null
  isSupported: boolean
  
  // UI state
  isLoading: boolean
  error: string | null
  hasPrompted: boolean
  
  // Actions
  requestLocation: () => Promise<boolean>
  fetchLocation: () => Promise<boolean>
  checkPermission: () => Promise<void>
  clearLocation: () => void
  setHasPrompted: (value: boolean) => void
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      location: null,
      coordinates: null,
      address: null,
      permissionStatus: null,
      isSupported: typeof window !== 'undefined' ? isGeolocationSupported() : false,
      isLoading: false,
      error: null,
      hasPrompted: false,

      requestLocation: async () => {
        set({ isLoading: true, error: null })

        try {
          const locationData = await getCurrentLocation()
          
          set({ 
            location: locationData,
            coordinates: locationData ? { latitude: locationData.latitude, longitude: locationData.longitude } : null,
            address: locationData?.address || null,
            isLoading: false,
            permissionStatus: 'granted',
            hasPrompted: true,
          })
          
          return true
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message,
            permissionStatus: error.code === 1 ? 'denied' : get().permissionStatus,
            hasPrompted: true,
          })
          
          return false
        }
      },

      fetchLocation: async () => {
        return get().requestLocation()
      },

      checkPermission: async () => {
        const status = await checkLocationPermission()
        set({ permissionStatus: status })
      },

      clearLocation: () => {
        set({ location: null, error: null })
      },

      setHasPrompted: (value) => {
        set({ hasPrompted: value })
      },
    }),
    {
      name: 'location-storage',
      partialize: (state) => ({
        location: state.location,
        coordinates: state.coordinates,
        address: state.address,
        hasPrompted: state.hasPrompted,
      }),
    }
  )
)






