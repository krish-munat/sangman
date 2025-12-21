import { format, formatDistance } from 'date-fns'

/**
 * Format currency (Indian Rupees)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format date
 */
export function formatDate(date: string | Date, formatStr: string = 'PPP'): string {
  return format(new Date(date), formatStr)
}

/**
 * Format relative time
 */
export function formatRelativeTime(date: string | Date): string {
  return formatDistance(new Date(date), new Date(), { addSuffix: true })
}

/**
 * Format time slot (e.g., "10:00 AM - 11:00 AM")
 */
export function formatTimeSlot(start: string, end: string): string {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }
  return `${formatTime(start)} - ${formatTime(end)}`
}

/**
 * Format distance (meters to km)
 */
export function formatLocationDistance(distanceInMeters: number): string {
  if (distanceInMeters < 1000) {
    return `${Math.round(distanceInMeters)} m`
  }
  return `${(distanceInMeters / 1000).toFixed(1)} km`
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone: string): string {
  // Indian phone number format: +91 XXXXX XXXXX
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
  }
  return phone
}

