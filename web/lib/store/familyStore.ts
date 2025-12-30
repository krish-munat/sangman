import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface FamilyMember {
  id: string
  parentUserId: string
  name: string
  dateOfBirth: string
  age: number
  gender: 'male' | 'female' | 'other'
  relation: 'son' | 'daughter' | 'spouse' | 'parent' | 'sibling' | 'other'
  bloodGroup?: string
  allergies?: string
  medicalHistory?: string
  phone?: string
  createdAt: string
  updatedAt: string
}

interface FamilyState {
  members: FamilyMember[]
  isHydrated: boolean
  
  // Actions
  addMember: (member: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateMember: (id: string, updates: Partial<FamilyMember>) => void
  removeMember: (id: string) => void
  getMembersByParent: (parentUserId: string) => FamilyMember[]
  setHydrated: () => void
}

export const AGE_LIMITS = {
  MAX_CHILD_AGE: 18,
  MIN_PARENT_AGE: 40,
  MIN_ADULT_AGE: 18,  // Minimum age for independent account
}

export function calculateAge(dateOfBirth: string): number {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      members: [],
      isHydrated: false,

      addMember: (member) => set((state) => ({
        members: [
          ...state.members,
          {
            ...member,
            id: `member-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      })),

      updateMember: (id, updates) => set((state) => ({
        members: state.members.map((m) =>
          m.id === id
            ? { ...m, ...updates, updatedAt: new Date().toISOString() }
            : m
        ),
      })),

      removeMember: (id) => set((state) => ({
        members: state.members.filter((m) => m.id !== id),
      })),

      getMembersByParent: (parentUserId) => {
        return get().members.filter((m) => m.parentUserId === parentUserId)
      },
      
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'sangman-family-store',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          }
        }
        return localStorage
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated()
        }
      },
    }
  )
)

// Selector hooks
export const useFamilyMembers = (parentUserId: string) => 
  useFamilyStore((state) => state.members.filter(m => m.parentUserId === parentUserId))

export const useIsFamilyHydrated = () => useFamilyStore((state) => state.isHydrated)
