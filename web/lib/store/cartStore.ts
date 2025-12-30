import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Cart Item Types
export interface CartItem {
  id: string
  name: string
  genericName?: string
  manufacturer?: string
  price: number
  mrp?: number
  quantity: number
  prescriptionRequired: boolean
  image?: string
  dosage?: string
  packSize?: string
}

export interface SpecialRequestItem {
  id: string
  name: string
  prescriptionId?: string
  notes?: string
  status: 'pending' | 'sourcing' | 'available' | 'unavailable'
  estimatedTime?: string
  createdAt: string
}

export interface PrescriptionUpload {
  id: string
  imageUrl: string
  uploadedAt: string
  processed: boolean
  extractedMedicines?: string[]
}

interface CartState {
  items: CartItem[]
  specialRequests: SpecialRequestItem[]
  prescriptions: PrescriptionUpload[]
  deliveryAddress: string | null
  deliverySlot: string | null
  
  // Actions
  addToCart: (item: Omit<CartItem, 'quantity'>) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  addSpecialRequest: (req: Omit<SpecialRequestItem, 'id' | 'status' | 'createdAt'>) => void
  removeSpecialRequest: (id: string) => void
  addPrescription: (imageUrl: string) => void
  removePrescription: (id: string) => void
  processPrescription: (id: string, medicines: string[]) => void
  setDeliveryAddress: (address: string) => void
  setDeliverySlot: (slot: string) => void
  clearCart: () => void
  
  // Computed
  getSubtotal: () => number
  getDiscount: () => number
  getDeliveryFee: () => number
  getTotal: () => number
  getItemCount: () => number
  hasPrescriptionItems: () => boolean
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      specialRequests: [],
      prescriptions: [],
      deliveryAddress: null,
      deliverySlot: null,

      addToCart: (newItem) => set((state) => {
        const existingItem = state.items.find((i) => i.id === newItem.id)
        
        if (existingItem) {
          // Increment quantity if exists
          return {
            items: state.items.map((i) =>
              i.id === newItem.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          }
        }
        
        // Add new item with quantity 1
        return {
          items: [...state.items, { ...newItem, quantity: 1 }],
        }
      }),

      removeFromCart: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id),
      })),

      updateQuantity: (id, quantity) => set((state) => {
        if (quantity <= 0) {
          return { items: state.items.filter((i) => i.id !== id) }
        }
        return {
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        }
      }),

      addSpecialRequest: (req) => set((state) => ({
        specialRequests: [
          ...state.specialRequests,
          {
            ...req,
            id: `req-${Date.now()}`,
            status: 'pending',
            createdAt: new Date().toISOString(),
          },
        ],
      })),

      removeSpecialRequest: (id) => set((state) => ({
        specialRequests: state.specialRequests.filter((r) => r.id !== id),
      })),

      addPrescription: (imageUrl) => set((state) => ({
        prescriptions: [
          ...state.prescriptions,
          {
            id: `rx-${Date.now()}`,
            imageUrl,
            uploadedAt: new Date().toISOString(),
            processed: false,
          },
        ],
      })),

      removePrescription: (id) => set((state) => ({
        prescriptions: state.prescriptions.filter((p) => p.id !== id),
      })),

      processPrescription: (id, medicines) => set((state) => ({
        prescriptions: state.prescriptions.map((p) =>
          p.id === id
            ? { ...p, processed: true, extractedMedicines: medicines }
            : p
        ),
      })),

      setDeliveryAddress: (address) => set({ deliveryAddress: address }),

      setDeliverySlot: (slot) => set({ deliverySlot: slot }),

      clearCart: () => set({
        items: [],
        specialRequests: [],
        prescriptions: [],
        deliveryAddress: null,
        deliverySlot: null,
      }),

      getSubtotal: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getDiscount: () => {
        const { items } = get()
        return items.reduce((total, item) => {
          const mrp = item.mrp || item.price
          return total + (mrp - item.price) * item.quantity
        }, 0)
      },

      getDeliveryFee: () => {
        const subtotal = get().getSubtotal()
        // Free delivery above ₹499
        return subtotal >= 499 ? 0 : 49
      },

      getTotal: () => {
        return get().getSubtotal() + get().getDeliveryFee()
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },

      hasPrescriptionItems: () => {
        return get().items.some((item) => item.prescriptionRequired)
      },
    }),
    {
      name: 'sangman-pharmacy-cart',
      partialize: (state) => ({
        items: state.items,
        specialRequests: state.specialRequests,
        prescriptions: state.prescriptions,
        deliveryAddress: state.deliveryAddress,
      }),
    }
  )
)

// Prescription-to-Cart Helper
export async function prescriptionToCart(
  prescriptionImage: File
): Promise<{ medicines: CartItem[]; notFound: string[] }> {
  // In production, this would:
  // 1. Upload image to server
  // 2. Use OCR/AI to extract medicine names
  // 3. Match with pharmacy inventory
  // 4. Return available medicines and unavailable ones

  // Mock implementation
  const mockMedicines: CartItem[] = [
    {
      id: 'med-1',
      name: 'Paracetamol 500mg',
      genericName: 'Acetaminophen',
      manufacturer: 'Cipla',
      price: 25,
      mrp: 30,
      quantity: 1,
      prescriptionRequired: false,
      packSize: 'Strip of 10 tablets',
    },
    {
      id: 'med-2',
      name: 'Azithromycin 500mg',
      genericName: 'Azithromycin',
      manufacturer: 'Sun Pharma',
      price: 89,
      mrp: 120,
      quantity: 1,
      prescriptionRequired: true,
      packSize: 'Strip of 3 tablets',
    },
  ]

  const notFound = ['Rare Medicine XYZ'] // Medicines not in inventory

  return { medicines: mockMedicines, notFound }
}

