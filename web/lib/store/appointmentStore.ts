import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Appointment, Doctor, Payment, TimeSlot } from '../../../shared/types'
import { generateOTP } from '@/lib/utils/calculations'

interface AppointmentState {
  appointments: Appointment[]
  isHydrated: boolean
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'otp'>) => Appointment
  updateAppointment: (id: string, updates: Partial<Appointment>) => void
  cancelAppointment: (id: string) => void
  getAppointmentsByPatient: (patientId: string) => Appointment[]
  getAppointmentsByDoctor: (doctorId: string) => Appointment[]
  getAppointmentById: (id: string) => Appointment | undefined
  setHydrated: () => void
}

export const useAppointmentStore = create<AppointmentState>()(
  persist(
    (set, get) => ({
      appointments: [],
      isHydrated: false,

      addAppointment: (appointmentData) => {
        const newAppointment: Appointment = {
          ...appointmentData,
          id: 'apt-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
          otp: generateOTP(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        set((state) => ({
          appointments: [...state.appointments, newAppointment],
        }))

        return newAppointment
      },

      updateAppointment: (id, updates) => {
        set((state) => ({
          appointments: state.appointments.map((apt) =>
            apt.id === id
              ? { ...apt, ...updates, updatedAt: new Date().toISOString() }
              : apt
          ),
        }))
      },

      cancelAppointment: (id) => {
        set((state) => ({
          appointments: state.appointments.map((apt) =>
            apt.id === id
              ? { ...apt, status: 'cancelled', updatedAt: new Date().toISOString() }
              : apt
          ),
        }))
      },

      getAppointmentsByPatient: (patientId) => {
        return get().appointments.filter((apt) => apt.patientId === patientId)
      },

      getAppointmentsByDoctor: (doctorId) => {
        return get().appointments.filter((apt) => apt.doctorId === doctorId)
      },

      getAppointmentById: (id) => {
        return get().appointments.find((apt) => apt.id === id)
      },

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'sangman-appointments',
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






