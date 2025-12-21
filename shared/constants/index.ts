// Shared constants for SANGMAN Platform

export const PLATFORM_CONFIG = {
  COMMISSION_RATE: 0.07, // 7%
  SUBSCRIPTION_DISCOUNT: 0.10, // 10%
  DEFAULT_EMERGENCY_MULTIPLIER: 1.5,
  NIGHT_HOURS: { start: 22, end: 6 },
  PEAK_HOURS: { start: 18, end: 22 },
} as const;

export const SPECIALIZATIONS = [
  'General Medicine',
  'Cardiology',
  'Dermatology',
  'Orthopedics',
  'Pediatrics',
  'Gynecology',
  'Neurology',
  'Psychiatry',
  'Ophthalmology',
  'ENT',
  'Dentistry',
  'Oncology',
  'Urology',
  'Gastroenterology',
  'Endocrinology',
] as const;

export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
} as const;

export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const ROUTES = {
  // Patient Routes
  PATIENT: {
    HOME: '/patient',
    DISCOVER: '/patient/discover',
    BOOKING: '/patient/booking',
    APPOINTMENTS: '/patient/appointments',
    PROFILE: '/patient/profile',
    SUBSCRIPTION: '/patient/subscription',
    HEALTH_CONTENT: '/patient/health-content',
    SUPPORT: '/patient/support',
  },
  // Doctor Routes
  DOCTOR: {
    HOME: '/doctor',
    DASHBOARD: '/doctor/dashboard',
    APPOINTMENTS: '/doctor/appointments',
    PROFILE: '/doctor/profile',
    VERIFICATION: '/doctor/verification',
    EARNINGS: '/doctor/earnings',
    SETTINGS: '/doctor/settings',
  },
  // Admin Routes
  ADMIN: {
    HOME: '/admin',
    DASHBOARD: '/admin/dashboard',
    DOCTORS: '/admin/doctors',
    VERIFICATION: '/admin/verification',
    PATIENTS: '/admin/patients',
    APPOINTMENTS: '/admin/appointments',
    ANALYTICS: '/admin/analytics',
    CONFIG: '/admin/config',
  },
  // Auth Routes
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    OTP: '/auth/otp',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
} as const;

export const MAP_CONFIG = {
  DEFAULT_ZOOM: 13,
  DEFAULT_CENTER: { lat: 28.6139, lng: 77.2090 }, // Delhi, India
  PROVIDER: 'openstreetmap',
} as const;

