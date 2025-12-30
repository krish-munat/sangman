import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Locale = 'en' | 'hi' | 'mr'

interface LanguageState {
  locale: Locale
  isHydrated: boolean
  setLocale: (locale: Locale) => void
  setHydrated: () => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      locale: 'en',
      isHydrated: false,
      setLocale: (locale) => {
        set({ locale })
        // Also set cookie for server-side rendering
        if (typeof document !== 'undefined') {
          document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000`
        }
      },
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'sangman-language',
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
          // Sync cookie with stored locale
          if (typeof document !== 'undefined') {
            document.cookie = `NEXT_LOCALE=${state.locale};path=/;max-age=31536000`
          }
        }
      },
    }
  )
)






