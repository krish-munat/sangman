import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, Patient, Doctor } from '../../../shared/types'

export type UserRole = 'patient' | 'doctor' | 'admin'

export interface AuthUser extends Omit<User, 'role'> {
  role: UserRole
  profileComplete?: boolean
}

interface AuthState {
  user: AuthUser | Patient | Doctor | null
  token: string | null
  isAuthenticated: boolean
  isHydrated: boolean
  isLoading: boolean
  userRole: UserRole | null
  
  // Actions
  login: (user: AuthUser | Patient | Doctor, token: string) => void
  logout: () => void
  updateUser: (user: Partial<AuthUser | Patient | Doctor>) => void
  setHydrated: () => void
  setLoading: (loading: boolean) => void
  markProfileComplete: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,
      isLoading: false,
      userRole: null,
      
      login: (user, token) => {
        set({ 
          user, 
          token, 
          isAuthenticated: true,
          userRole: user.role as UserRole,
          isLoading: false,
        })
      },
      
      logout: () => {
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          userRole: null,
          isLoading: false,
        })
      },
      
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      
      setHydrated: () => set({ isHydrated: true }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      markProfileComplete: () =>
        set((state) => ({
          user: state.user ? { ...state.user, profileComplete: true } : null,
        })),
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
          // Restore userRole from user object
          if (state.user?.role) {
            state.userRole = state.user.role as UserRole
          }
        }
      },
    }
  )
)

// Selector hooks for better performance
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useUserRole = () => useAuthStore((state) => state.userRole)
export const useCurrentUser = () => useAuthStore((state) => state.user)
