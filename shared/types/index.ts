// Shared TypeScript types for SANGMAN Platform

export type UserRole = 'patient' | 'doctor' | 'admin' | 'support';

export interface User {
  id: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileDocument {
  id: string;
  name: string;
  type: 'prescription' | 'report' | 'medical_report' | 'insurance' | 'id_proof' | 'other';
  url: string;
  size: number;
  uploadedAt: string;
}

export interface Patient extends User {
  role: 'patient';
  name: string;
  age?: number;
  dateOfBirth?: string;
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | '';
  gender: 'male' | 'female' | 'other';
  allergies?: string;
  medicalHistory?: string;
  documents?: ProfileDocument[];
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  subscription?: Subscription;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface Doctor extends User {
  role: 'doctor';
  name: string;
  profilePhoto?: string;
  specializations: string[];
  experience: number; // years
  qualifications: string[];
  clinicAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  consultationFee: number;
  emergencyFee?: number;
  availability: Availability;
  emergencyAvailable: boolean;
  verified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  rating: number;
  totalReviews: number;
  documents?: DoctorDocuments;
}

export interface DoctorDocuments {
  aadhaarCard?: string;
  panCard?: string;
  medicalLicense?: string;
  degree?: string[];
  selfie?: string;
}

export interface Availability {
  days: {
    [key: string]: {
      available: boolean;
      slots: TimeSlot[];
    };
  };
  timezone: string;
}

export interface TimeSlot {
  start: string; // HH:mm format
  end: string;
  available: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patient?: Patient;
  doctor?: Doctor;
  date: string;
  timeSlot: TimeSlot;
  type: 'normal' | 'emergency';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  otp?: string;
  otpVerified: boolean;
  payment: Payment;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  consultationFee: number;
  platformFee: number; // 7%
  emergencySurcharge?: number;
  subscriptionDiscount?: number; // 10% if subscribed
  totalAmount: number;
  status: 'pending' | 'completed' | 'refunded';
  transactionId?: string;
  paymentMethod: 'card' | 'upi' | 'wallet';
}

export interface Review {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  patientId: string;
  plan: 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  discount: number; // 10%
}

export interface EmergencyPricing {
  baseMultiplier: number;
  timeMultipliers: {
    night: number; // 22:00 - 06:00
    peak: number; // 18:00 - 22:00
  };
  availabilityMultiplier: number; // based on doctor availability
}

export interface PlatformConfig {
  commissionRate: number; // default 7%
  subscriptionDiscount: number; // default 10%
  emergencyPricing: EmergencyPricing;
  supportContact: {
    email: string;
    phone: string;
    chatEnabled: boolean;
  };
  faq: FAQItem[];
  healthTips: HealthTip[];
  termsAndPolicies: {
    termsOfService: string;
    privacyPolicy: string;
    refundPolicy: string;
  };
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface HealthTip {
  id: string;
  title: string;
  content: string;
  category: 'vedic' | 'wellness' | 'lifestyle' | 'general';
  disclaimer: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'booking' | 'emergency' | 'payment' | 'verification' | 'general';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface Analytics {
  totalPatients: number;
  totalDoctors: number;
  activeDoctors: number;
  totalAppointments: number;
  emergencyAppointments: number;
  revenue: {
    total: number;
    platformFee: number;
    byRegion: { [region: string]: number };
  };
  regionWiseUsage: { [region: string]: number };
}

