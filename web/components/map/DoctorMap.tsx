'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Doctor } from '../../../shared/types'
import { formatLocationDistance } from '@/lib/utils/format'

// Fix for default marker icons in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
}

interface DoctorMapProps {
  doctors: Doctor[]
  userLocation?: { lat: number; lng: number }
  onDoctorSelect?: (doctor: Doctor) => void
  selectedDoctorId?: string
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

export default function DoctorMap({
  doctors,
  userLocation,
  onDoctorSelect,
  selectedDoctorId,
}: DoctorMapProps) {
  const mapRef = useRef<L.Map | null>(null)

  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : doctors.length > 0 && doctors[0]?.clinicAddress?.coordinates
    ? [
        doctors[0].clinicAddress.coordinates.latitude,
        doctors[0].clinicAddress.coordinates.longitude,
      ]
    : [28.6139, 77.2090] // Default to Delhi

  const createCustomIcon = (isSelected: boolean, isEmergency: boolean) => {
    const color = isSelected ? '#ef4444' : isEmergency ? '#f59e0b' : '#0ea5e9'
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        width: 32px;
        height: 32px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
      ">${isEmergency ? '🚨' : '🏥'}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    })
  }

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              className: 'user-marker',
              html: `<div style="
                width: 24px;
                height: 24px;
                background-color: #10b981;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              "></div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            })}
          >
            <Popup>Your Location</Popup>
          </Marker>
        )}

        {doctors.map((doctor) => {
          if (!doctor?.clinicAddress?.coordinates) return null
          
          const distance = userLocation
            ? calculateDistance(
                userLocation.lat,
                userLocation.lng,
                doctor.clinicAddress.coordinates.latitude,
                doctor.clinicAddress.coordinates.longitude
              )
            : null

          return (
            <Marker
              key={doctor.id}
              position={[
                doctor.clinicAddress.coordinates.latitude,
                doctor.clinicAddress.coordinates.longitude,
              ]}
              icon={createCustomIcon(selectedDoctorId === doctor.id, doctor.emergencyAvailable || false)}
              eventHandlers={{
                click: () => onDoctorSelect?.(doctor),
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-sm mb-1">{doctor.name}</h3>
                  <p className="text-xs text-neutral-600 mb-1">
                    {doctor.specializations.join(', ')}
                  </p>
                  {distance && (
                    <p className="text-xs text-primary-500">
                      {formatLocationDistance(distance)} away
                    </p>
                  )}
                  {doctor.emergencyAvailable && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-emergency-100 text-emergency-700 text-xs rounded">
                      Emergency Available
                    </span>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}

        <MapController center={center} />
      </MapContainer>
    </div>
  )
}

