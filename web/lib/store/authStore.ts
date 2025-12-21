import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, Patient, Doctor } from '../../../shared/types'

interface AuthState {
  user: User | Patient | Doctor | null
  token: string | null
  isAuthenticated: boolean
  isHydrated: boolean
  login: (user: User | Patient | Doctor, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User | Patient | Doctor>) => void
  setHydrated: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,
      login: (user, token) => {
        set({ user, token, isAuthenticated: true })
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'sangman-auth',
      storage: createJSONStorage(() => {
        // Safe check for SSR
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
