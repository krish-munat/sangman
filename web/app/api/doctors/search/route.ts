import { NextRequest, NextResponse } from 'next/server'

// Mock doctor data with locations
const doctors = [
  { id: '1', name: 'Dr. Priya Sharma', specialty: 'Cardiologist', lat: 28.6139, lng: 77.2090, rating: 4.9, experience: 15, fee: 800, availability: ['Mon', 'Wed', 'Fri'], hospital: 'AIIMS Delhi', image: '/doctors/1.jpg' },
  { id: '2', name: 'Dr. Rahul Gupta', specialty: 'Dermatologist', lat: 28.6280, lng: 77.2189, rating: 4.7, experience: 10, fee: 600, availability: ['Tue', 'Thu', 'Sat'], hospital: 'Max Hospital', image: '/doctors/2.jpg' },
  { id: '3', name: 'Dr. Anjali Singh', specialty: 'Pediatrician', lat: 28.5355, lng: 77.2110, rating: 4.8, experience: 12, fee: 500, availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], hospital: 'Apollo Clinic', image: '/doctors/3.jpg' },
  { id: '4', name: 'Dr. Vikram Patel', specialty: 'Orthopedic', lat: 28.6129, lng: 77.2295, rating: 4.6, experience: 18, fee: 900, availability: ['Mon', 'Wed', 'Fri'], hospital: 'Fortis Hospital', image: '/doctors/4.jpg' },
  { id: '5', name: 'Dr. Meera Reddy', specialty: 'Gynecologist', lat: 28.6448, lng: 77.2167, rating: 4.9, experience: 20, fee: 1000, availability: ['Tue', 'Thu', 'Sat'], hospital: 'Cloudnine Hospital', image: '/doctors/5.jpg' },
  { id: '6', name: 'Dr. Arjun Kapoor', specialty: 'Neurologist', lat: 28.5672, lng: 77.2100, rating: 4.5, experience: 8, fee: 700, availability: ['Mon', 'Wed'], hospital: 'Medanta Hospital', image: '/doctors/6.jpg' },
  { id: '7', name: 'Dr. Sunita Verma', specialty: 'General Physician', lat: 28.6304, lng: 77.2177, rating: 4.4, experience: 25, fee: 400, availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], hospital: 'City Clinic', image: '/doctors/7.jpg' },
  { id: '8', name: 'Dr. Rajesh Kumar', specialty: 'ENT Specialist', lat: 28.6520, lng: 77.2315, rating: 4.7, experience: 14, fee: 650, availability: ['Mon', 'Thu', 'Sat'], hospital: 'BLK Hospital', image: '/doctors/8.jpg' },
  { id: '9', name: 'Dr. Neha Joshi', specialty: 'Psychiatrist', lat: 28.5918, lng: 77.2273, rating: 4.8, experience: 11, fee: 1200, availability: ['Tue', 'Wed', 'Fri'], hospital: 'NIMHANS Delhi', image: '/doctors/9.jpg' },
  { id: '10', name: 'Dr. Sanjay Mehta', specialty: 'Gastroenterologist', lat: 28.6100, lng: 77.1900, rating: 4.6, experience: 16, fee: 850, availability: ['Mon', 'Wed', 'Fri'], hospital: 'Sir Ganga Ram Hospital', image: '/doctors/10.jpg' },
  { id: '11', name: 'Dr. Pooja Agarwal', specialty: 'Ophthalmologist', lat: 28.6350, lng: 77.2250, rating: 4.9, experience: 13, fee: 550, availability: ['Mon', 'Tue', 'Thu', 'Fri'], hospital: 'Eye Care Centre', image: '/doctors/11.jpg' },
  { id: '12', name: 'Dr. Amit Sharma', specialty: 'Dentist', lat: 28.6200, lng: 77.2400, rating: 4.5, experience: 9, fee: 450, availability: ['Mon', 'Wed', 'Sat'], hospital: 'Dental Solutions', image: '/doctors/12.jpg' },
]

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const latitude = parseFloat(searchParams.get('latitude') || '28.6139')
    const longitude = parseFloat(searchParams.get('longitude') || '77.2090')
    const query = searchParams.get('query')?.toLowerCase() || ''
    const radiusKm = parseFloat(searchParams.get('radius_km') || '10')
    const specialty = searchParams.get('specialty')?.toLowerCase()
    
    // Filter doctors
    let results = doctors.map(doctor => {
      const distance = calculateDistance(latitude, longitude, doctor.lat, doctor.lng)
      return { ...doctor, distance: Math.round(distance * 10) / 10 }
    })
    
    // Filter by radius (simulating PostGIS ST_DWithin)
    results = results.filter(d => d.distance <= radiusKm)
    
    // Filter by query (name or specialty)
    if (query) {
      results = results.filter(d => 
        d.name.toLowerCase().includes(query) ||
        d.specialty.toLowerCase().includes(query)
      )
    }
    
    // Filter by specific specialty
    if (specialty) {
      results = results.filter(d => d.specialty.toLowerCase() === specialty)
    }
    
    // Sort by distance ASC, then rating DESC
    results.sort((a, b) => {
      if (a.distance !== b.distance) return a.distance - b.distance
      return b.rating - a.rating
    })
    
    console.log(`[Doctor Search] Found ${results.length} doctors within ${radiusKm}km of (${latitude}, ${longitude})`)
    
    return NextResponse.json({
      success: true,
      data: results,
      meta: {
        total: results.length,
        latitude,
        longitude,
        radiusKm,
        query,
      },
    })
  } catch (error) {
    console.error('[Doctor Search Error]:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to search doctors' },
      { status: 500 }
    )
  }
}

