// Profile Document Types
export interface ProfileDocument {
  id: string
  name: string
  type: 'prescription' | 'report' | 'id_proof' | 'insurance' | 'other'
  url: string
  uploadedAt: string
  size?: number
}

// Family Member Types
export interface FamilyMember {
  id: string
  name: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  relation: string
  bloodGroup?: string
  allergies?: string
  medicalHistory?: string
  documents?: ProfileDocument[]
  createdAt: string
  updatedAt: string
}

// User Types
export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: 'patient' | 'doctor' | 'admin'
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
  bloodGroup?: string
  allergies?: string
  medicalHistory?: string
  documents?: ProfileDocument[]
  emergencyContact?: {
    name: string
    phone: string
    relation: string
  }
  familyMembers?: FamilyMember[]
  createdAt: string
  updatedAt: string
}

// Appointment Types
export interface Appointment {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  specialty: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  type: 'video' | 'in-person'
  symptoms?: string
  notes?: string
  escrowStatus?: 'held' | 'released' | 'refunded'
  amount?: number
  createdAt: string
}

// Doctor Types
export interface Doctor {
  id: string
  name: string
  specialty: string
  experience: number
  rating: number
  consultationFee: number
  location: string
  languages: string[]
  education: string[]
  image?: string
  available: boolean
  nextSlot?: string
}

