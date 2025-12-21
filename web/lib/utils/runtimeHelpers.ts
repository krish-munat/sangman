/**
 * Runtime helper functions to prevent common errors
 */

/**
 * Safe access to nested object properties
 */
export function safeGet<T>(
  obj: any,
  path: string,
  defaultValue: T
): T {
  try {
    const keys = path.split('.')
    let result = obj
    for (const key of keys) {
      if (result == null) return defaultValue
      result = result[key]
    }
    return result != null ? result : defaultValue
  } catch {
    return defaultValue
  }
}

/**
 * Check if value exists and is not null/undefined
 */
export function exists<T>(value: T | null | undefined): value is T {
  return value != null
}

/**
 * Safe array access
 */
export function safeArray<T>(arr: T[] | null | undefined): T[] {
  return Array.isArray(arr) ? arr : []
}

/**
 * Safe number conversion
 */
export function safeNumber(value: any, defaultValue: number = 0): number {
  const num = Number(value)
  return isNaN(num) ? defaultValue : num
}

/**
 * Safe string conversion
 */
export function safeString(value: any, defaultValue: string = ''): string {
  if (value == null) return defaultValue
  return String(value)
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Check if code is running in browser
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

/**
 * Safe localStorage access
 */
export function safeLocalStorage(): Storage | null {
  if (!isBrowser()) return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

