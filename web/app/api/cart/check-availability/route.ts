import { NextRequest, NextResponse } from 'next/server'

// Mock pharmacy data with inventory
const pharmacies = [
  { id: 'ph1', name: 'Apollo Pharmacy - Connaught Place', lat: 28.6315, lng: 77.2167, isActive: true, rating: 4.5, deliveryTime: 12 },
  { id: 'ph2', name: 'MedPlus - Karol Bagh', lat: 28.6519, lng: 77.1909, isActive: true, rating: 4.3, deliveryTime: 15 },
  { id: 'ph3', name: 'Netmeds Store - Lajpat Nagar', lat: 28.5677, lng: 77.2433, isActive: true, rating: 4.6, deliveryTime: 18 },
  { id: 'ph4', name: 'PharmEasy Hub - Rohini', lat: 28.7495, lng: 77.0568, isActive: true, rating: 4.4, deliveryTime: 20 },
  { id: 'ph5', name: 'Wellness Forever - South Delhi', lat: 28.5245, lng: 77.2066, isActive: true, rating: 4.7, deliveryTime: 14 },
]

// Mock medicine inventory
const inventory: Record<string, Array<{ medicineId: string; inStock: boolean; price: number; quantity: number }>> = {
  'ph1': [
    { medicineId: 'dolo-650', inStock: true, price: 30, quantity: 100 },
    { medicineId: 'crocin', inStock: true, price: 25, quantity: 50 },
    { medicineId: 'azithromycin', inStock: true, price: 85, quantity: 30 },
    { medicineId: 'omeprazole', inStock: true, price: 45, quantity: 80 },
    { medicineId: 'vitamin-d3', inStock: true, price: 150, quantity: 25 },
  ],
  'ph2': [
    { medicineId: 'dolo-650', inStock: true, price: 32, quantity: 60 },
    { medicineId: 'crocin', inStock: false, price: 25, quantity: 0 },
    { medicineId: 'azithromycin', inStock: true, price: 80, quantity: 20 },
    { medicineId: 'cetirizine', inStock: true, price: 35, quantity: 100 },
  ],
  'ph3': [
    { medicineId: 'dolo-650', inStock: true, price: 28, quantity: 200 },
    { medicineId: 'crocin', inStock: true, price: 24, quantity: 150 },
    { medicineId: 'vitamin-d3', inStock: true, price: 145, quantity: 40 },
    { medicineId: 'calcium', inStock: true, price: 120, quantity: 35 },
  ],
  'ph4': [
    { medicineId: 'dolo-650', inStock: true, price: 30, quantity: 80 },
    { medicineId: 'azithromycin', inStock: false, price: 85, quantity: 0 },
    { medicineId: 'omeprazole', inStock: true, price: 42, quantity: 60 },
  ],
  'ph5': [
    { medicineId: 'dolo-650', inStock: true, price: 29, quantity: 120 },
    { medicineId: 'crocin', inStock: true, price: 26, quantity: 90 },
    { medicineId: 'azithromycin', inStock: true, price: 82, quantity: 45 },
    { medicineId: 'vitamin-d3', inStock: true, price: 148, quantity: 30 },
    { medicineId: 'calcium', inStock: true, price: 115, quantity: 50 },
    { medicineId: 'omeprazole', inStock: true, price: 44, quantity: 70 },
  ],
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userLocation, medicineList } = body as {
      userLocation: { lat: number; lng: number }
      medicineList: Array<{ medicineId: string; quantity: number }>
    }
    
    if (!userLocation || !medicineList || medicineList.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User location and medicine list are required' },
        { status: 400 }
      )
    }
    
    const { lat, lng } = userLocation
    const maxRadius = 5 // km
    
    // Find pharmacies within radius
    const nearbyPharmacies = pharmacies
      .filter(p => p.isActive)
      .map(p => ({
        ...p,
        distance: calculateDistance(lat, lng, p.lat, p.lng),
      }))
      .filter(p => p.distance <= maxRadius)
      .sort((a, b) => a.distance - b.distance)
    
    if (nearbyPharmacies.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No pharmacies found within 5km of your location',
        data: null,
      })
    }
    
    // Find pharmacy with ALL items in stock
    let bestPharmacy = null
    let itemsWithPrices: Array<{ medicineId: string; price: number; available: boolean }> = []
    
    for (const pharmacy of nearbyPharmacies) {
      const pharmacyInventory = inventory[pharmacy.id] || []
      let allInStock = true
      const items: typeof itemsWithPrices = []
      
      for (const requestedItem of medicineList) {
        const inventoryItem = pharmacyInventory.find(i => i.medicineId === requestedItem.medicineId)
        
        if (!inventoryItem || !inventoryItem.inStock || inventoryItem.quantity < requestedItem.quantity) {
          allInStock = false
          items.push({
            medicineId: requestedItem.medicineId,
            price: 0,
            available: false,
          })
        } else {
          items.push({
            medicineId: requestedItem.medicineId,
            price: inventoryItem.price,
            available: true,
          })
        }
      }
      
      if (allInStock) {
        bestPharmacy = pharmacy
        itemsWithPrices = items
        break
      }
    }
    
    if (!bestPharmacy) {
      // Find partial availability from nearest pharmacy
      const nearest = nearbyPharmacies[0]
      const pharmacyInventory = inventory[nearest.id] || []
      const partialItems = medicineList.map(requested => {
        const found = pharmacyInventory.find(i => i.medicineId === requested.medicineId)
        return {
          medicineId: requested.medicineId,
          price: found?.price || 0,
          available: found?.inStock && (found.quantity >= requested.quantity),
        }
      })
      
      return NextResponse.json({
        success: true,
        message: 'Some items may not be available',
        data: {
          pharmacy: {
            id: nearest.id,
            name: nearest.name,
            distance: Math.round(nearest.distance * 10) / 10,
            deliveryTime: nearest.deliveryTime,
            rating: nearest.rating,
          },
          items: partialItems,
          allItemsAvailable: false,
          estimatedDelivery: `${nearest.deliveryTime}-${nearest.deliveryTime + 5} mins`,
        },
      })
    }
    
    console.log(`[Cart] Found ${bestPharmacy.name} with all items in stock, ${bestPharmacy.distance.toFixed(1)}km away`)
    
    return NextResponse.json({
      success: true,
      message: 'All items available!',
      data: {
        pharmacy: {
          id: bestPharmacy.id,
          name: bestPharmacy.name,
          distance: Math.round(bestPharmacy.distance * 10) / 10,
          deliveryTime: bestPharmacy.deliveryTime,
          rating: bestPharmacy.rating,
        },
        items: itemsWithPrices,
        allItemsAvailable: true,
        estimatedDelivery: `${bestPharmacy.deliveryTime}-${bestPharmacy.deliveryTime + 3} mins`,
        sangmanNow: bestPharmacy.deliveryTime <= 15,
      },
    })
  } catch (error) {
    console.error('[Cart Check Error]:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to check availability' },
      { status: 500 }
    )
  }
}

