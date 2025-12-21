import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface FamilyMember {
  id: string
  parentUserId: string
  name: string
  dateOfBirth: string
  age: number
  gender: 'male' | 'female' | 'other'
  relation: 'son' | 'daughter' | 'spouse' | 'parent' | 'other'
  bloodGroup?: string
  allergies?: string
  medicalHistory?: string
  profilePhoto?: string
  documents?: ProfileDocument[]
  createdAt: string
  updatedAt: string
}

export interface ProfileDocument {
  id: string
  name: string
  type: 'id_proof' | 'medical_report' | 'prescription' | 'insurance' | 'other'
  url: string
  uploadedAt: string
  size: number // in bytes
}

interface FamilyState {
  members: FamilyMember[]
  isHydrated: boolean
  
  // Actions
  addMember: (member: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>) => FamilyMember
  updateMember: (id: string, updates: Partial<FamilyMember>) => void
  removeMember: (id: string) => void
  getMembersByParent: (parentUserId: string) => FamilyMember[]
  getMemberById: (id: string) => FamilyMember | undefined
  addDocumentToMember: (memberId: string, document: Omit<ProfileDocument, 'id' | 'uploadedAt'>) => void
  removeDocumentFromMember: (memberId: string, documentId: string) => void
}

// Age calculation helper
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

// Age validation constants
export const AGE_LIMITS = {
  MIN_ADULT_AGE: 18, // Minimum age for independent account
  MAX_CHILD_AGE: 16, // Maximum age for child profile under parent
  MIN_CHILD_AGE: 0,
}

// Generate unique ID
const generateId = () => `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      members: [],
      isHydrated: false,

      addMember: (memberData) => {
        const newMember: FamilyMember = {
          ...memberData,
          id: generateId(),
          age: calculateAge(memberData.dateOfBirth),
          documents: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        set((state) => ({
          members: [...state.members, newMember],
        }))

        return newMember
      },

      updateMember: (id, updates) => {
        set((state) => ({
          members: state.members.map((member) =>
            member.id === id
              ? {
                  ...member,
                  ...updates,
                  age: updates.dateOfBirth ? calculateAge(updates.dateOfBirth) : member.age,
                  updatedAt: new Date().toISOString(),
                }
              : member
          ),
        }))
      },

      removeMember: (id) => {
        set((state) => ({
          members: state.members.filter((member) => member.id !== id),
        }))
      },

      getMembersByParent: (parentUserId) => {
        return get().members.filter((member) => member.parentUserId === parentUserId)
      },

      getMemberById: (id) => {
        return get().members.find((member) => member.id === id)
      },

      addDocumentToMember: (memberId, document) => {
        const newDocument: ProfileDocument = {
          ...document,
          id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          uploadedAt: new Date().toISOString(),
        }

        set((state) => ({
          members: state.members.map((member) =>
            member.id === memberId
              ? {
                  ...member,
                  documents: [...(member.documents || []), newDocument],
                  updatedAt: new Date().toISOString(),
                }
              : member
          ),
        }))
      },

      removeDocumentFromMember: (memberId, documentId) => {
        set((state) => ({
          members: state.members.map((member) =>
            member.id === memberId
              ? {
                  ...member,
                  documents: (member.documents || []).filter((doc) => doc.id !== documentId),
                  updatedAt: new Date().toISOString(),
                }
              : member
          ),
        }))
      },
    }),
    {
      name: 'family-members-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isHydrated = true
        }
      },
    }
  )
)

