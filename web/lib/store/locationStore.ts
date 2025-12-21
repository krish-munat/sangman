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
  
  // Permission status
  permissionStatus: PermissionState | null
  isSupported: boolean
  
  // UI state
  isLoading: boolean
  error: string | null
  hasPrompted: boolean
  
  // Actions
  requestLocation: () => Promise<boolean>
  checkPermission: () => Promise<void>
  clearLocation: () => void
  setHasPrompted: (value: boolean) => void
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      location: null,
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
        hasPrompted: state.hasPrompted,
      }),
    }
  )
)

