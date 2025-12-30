'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Zap, Search, Upload, ShoppingCart, MapPin, Clock, 
  Plus, Minus, Trash2, Camera, Loader2, CheckCircle,
  Package, Truck, Star, X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useLocationStore } from '@/lib/store/locationStore'

interface Medicine {
  id: string
  name: string
  dosage: string
  quantity: number
  price: number
  inStock: boolean
}

interface CartItem extends Medicine {
  cartQty: number
}

// Mock medicines catalog
const medicineCatalog: Medicine[] = [
  { id: 'dolo-650', name: 'Dolo 650mg', dosage: 'Paracetamol', quantity: 10, price: 30, inStock: true },
  { id: 'crocin', name: 'Crocin Advance', dosage: '500mg', quantity: 10, price: 25, inStock: true },
  { id: 'azithromycin', name: 'Azithromycin', dosage: '500mg', quantity: 6, price: 85, inStock: true },
  { id: 'omeprazole', name: 'Omeprazole', dosage: '20mg', quantity: 15, price: 45, inStock: true },
  { id: 'vitamin-d3', name: 'Vitamin D3', dosage: '60000 IU', quantity: 4, price: 150, inStock: true },
  { id: 'cetirizine', name: 'Cetirizine', dosage: '10mg', quantity: 10, price: 35, inStock: true },
  { id: 'calcium', name: 'Calcium + D3', dosage: '500mg', quantity: 30, price: 120, inStock: true },
  { id: 'multivitamin', name: 'Multivitamin', dosage: 'Daily', quantity: 30, price: 180, inStock: true },
]

export default function PharmacyPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [nearestPharmacy, setNearestPharmacy] = useState<any>(null)
  const [isUploadingPrescription, setIsUploadingPrescription] = useState(false)
  const [extractedMedicines, setExtractedMedicines] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { location } = useLocationStore()

  const filteredMedicines = medicineCatalog.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.dosage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const addToCart = (medicine: Medicine) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === medicine.id)
      if (existing) {
        return prev.map(item =>
          item.id === medicine.id
            ? { ...item, cartQty: item.cartQty + 1 }
            : item
        )
      }
      return [...prev, { ...medicine, cartQty: 1 }]
    })
    toast.success(`Added ${medicine.name} to cart`)
  }

  const updateCartQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.cartQty + delta
        return newQty > 0 ? { ...item, cartQty: newQty } : item
      }
      return item
    }).filter(item => item.cartQty > 0))
  }

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.cartQty), 0)
  const cartCount = cart.reduce((sum, item) => sum + item.cartQty, 0)

  const handleCheckAvailability = async () => {
    if (cart.length === 0) {
      toast.error('Add items to cart first')
      return
    }

    setIsChecking(true)
    try {
      const response = await fetch('/api/cart/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userLocation: location || { lat: 28.6139, lng: 77.2090 },
          medicineList: cart.map(item => ({
            medicineId: item.id,
            quantity: item.cartQty,
          })),
        }),
      })

      const result = await response.json()
      if (result.success && result.data) {
        setNearestPharmacy(result.data)
        toast.success(result.data.allItemsAvailable 
          ? 'All items available!' 
          : 'Some items may not be available'
        )
      }
    } catch (error) {
      toast.error('Failed to check availability')
    } finally {
      setIsChecking(false)
    }
  }

  const handlePrescriptionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingPrescription(true)
    try {
      const formData = new FormData()
      formData.append('prescription', file)

      const response = await fetch('/api/pharmacy/upload-prescription', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      if (result.success && result.data?.medicines) {
        setExtractedMedicines(result.data.medicines)
        toast.success(`Extracted ${result.data.medicines.length} medicines from prescription`)
      }
    } catch (error) {
      toast.error('Failed to process prescription')
    } finally {
      setIsUploadingPrescription(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-8 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Sangman Now</h1>
              <p className="text-white/80">Medicines delivered in 15 minutes</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medicines..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Upload Prescription */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-500" />
            Upload Prescription
          </h2>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handlePrescriptionUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingPrescription}
            className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8
              hover:border-emerald-500 transition-colors text-center"
          >
            {isUploadingPrescription ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                <span className="text-gray-500">Processing prescription...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  Click to upload prescription image
                </span>
                <span className="text-sm text-gray-400">AI will extract medicine names</span>
              </div>
            )}
          </button>

          {/* Extracted Medicines */}
          {extractedMedicines.length > 0 && (
            <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <h3 className="font-medium text-emerald-800 dark:text-emerald-300 mb-3">
                Extracted Medicines:
              </h3>
              <div className="space-y-2">
                {extractedMedicines.map((med, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      {med.name} - {med.dosage}
                    </span>
                    <span className="text-gray-500">{med.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Medicine Grid */}
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Popular Medicines</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {filteredMedicines.map((medicine) => (
            <div
              key={medicine.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-3">
                <Package className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                {medicine.name}
              </h3>
              <p className="text-xs text-gray-500 mb-2">{medicine.dosage}</p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-600">₹{medicine.price}</span>
                <button
                  onClick={() => addToCart(medicine)}
                  className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Nearest Pharmacy Result */}
        {nearestPharmacy && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm border border-emerald-200 dark:border-emerald-800"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                <Truck className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {nearestPharmacy.pharmacy.name}
                </h3>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {nearestPharmacy.pharmacy.distance} km
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {nearestPharmacy.estimatedDelivery}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500" />
                    {nearestPharmacy.pharmacy.rating}
                  </span>
                </div>
                {nearestPharmacy.sangmanNow && (
                  <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                    <Zap className="w-3 h-3" />
                    Sangman Now Eligible
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-4 right-4 max-w-4xl mx-auto">
          <button
            onClick={() => setShowCart(true)}
            className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600
              text-white rounded-2xl shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-emerald-600 rounded-full text-xs font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              </div>
              <span className="font-medium">{cart.length} items in cart</span>
            </div>
            <span className="font-bold text-lg">₹{cartTotal}</span>
          </button>
        </div>
      )}

      {/* Cart Modal */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Cart</h2>
                <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3>
                      <p className="text-sm text-gray-500">₹{item.price} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCartQty(item.id, -1)}
                        className="p-1 bg-gray-200 dark:bg-gray-600 rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.cartQty}</span>
                      <button
                        onClick={() => updateCartQty(item.id, 1)}
                        className="p-1 bg-gray-200 dark:bg-gray-600 rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-emerald-600">₹{cartTotal}</span>
                </div>
              </div>

              <button
                onClick={handleCheckAvailability}
                disabled={isChecking}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl
                  font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50
                  flex items-center justify-center gap-2"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Checking availability...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Check Availability & Order
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

