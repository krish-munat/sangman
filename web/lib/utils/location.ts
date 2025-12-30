/**
 * Location Utility Service
 * Handles geolocation permissions and location fetching
 */

export interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
  address?: string
  city?: string
  state?: string
  country?: string
  pincode?: string
}

export interface LocationError {
  code: number
  message: string
}

// Check if geolocation is supported
export function isGeolocationSupported(): boolean {
  return 'geolocation' in navigator
}

// Check current permission status
export async function checkLocationPermission(): Promise<PermissionState | null> {
  if (!('permissions' in navigator)) {
    return null
  }
  
  try {
    const result = await navigator.permissions.query({ name: 'geolocation' })
    return result.state
  } catch (error) {
    console.error('Error checking location permission:', error)
    return null
  }
}

// Get current location
export function getCurrentLocation(): Promise<LocationData> {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by this browser',
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        }

        // Try to get address from coordinates (reverse geocoding)
        try {
          const address = await reverseGeocode(
            position.coords.latitude,
            position.coords.longitude
          )
          Object.assign(locationData, address)
        } catch (error) {
          console.log('Could not fetch address:', error)
        }

        resolve(locationData)
      },
      (error) => {
        let message = 'Unknown error occurred'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission denied. Please enable location access in your browser settings.'
            break
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable. Please try again.'
            break
          case error.TIMEOUT:
            message = 'Location request timed out. Please try again.'
            break
        }

        reject({
          code: error.code,
          message,
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    )
  })
}

// Reverse geocoding using OpenStreetMap Nominatim (free, no API key required)
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<Partial<LocationData>> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch address')
    }

    const data = await response.json()
    const address = data.address || {}

    return {
      address: data.display_name,
      city: address.city || address.town || address.village || address.suburb,
      state: address.state,
      country: address.country,
      pincode: address.postcode,
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return {}
  }
}

// Calculate distance between two coordinates (in km)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

// Format distance for display
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`
  }
  return `${km.toFixed(1)} km`
}






