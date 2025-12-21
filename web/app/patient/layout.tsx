'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Home,
  Search,
  Calendar,
  User,
  Crown,
  BookOpen,
  HelpCircle,
  LogOut,
  Heart,
  Moon,
  Sun,
  Menu,
  X,
  MapPin,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import LocationPermission from '@/components/LocationPermission'

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout, isAuthenticated, isHydrated } = useAuthStore()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
      if (savedTheme) {
        setTheme(savedTheme)
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark')
        }
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark')
        document.documentElement.classList.add('dark')
      }
    }
  }, [])

  useEffect(() => {
    if (isHydrated && (!isAuthenticated || user?.role !== 'patient')) {
      router.push('/auth/login?role=patient')
    }
  }, [isHydrated, isAuthenticated, user, router])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', newTheme)
  }

  const navItems = [
    { href: '/patient', icon: Home, label: 'Home' },
    { href: '/patient/discover', icon: Search, label: 'Find Doctors' },
    { href: '/patient/appointments', icon: Calendar, label: 'Appointments' },
    { href: '/patient/profile', icon: User, label: 'Profile' },
    { href: '/patient/subscription', icon: Crown, label: 'Subscription' },
    { href: '/patient/health-content', icon: BookOpen, label: 'Health Tips' },
    { href: '/patient/support', icon: HelpCircle, label: 'Support' },
  ]

  // Show loading while hydrating
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!isAuthenticated || user?.role !== 'patient') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700 z-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
              SANGMAN
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-neutral-800 border-r border-gray-200 dark:border-neutral-700 z-50 transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" fill="white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
              SANGMAN
            </span>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {(user as any)?.name || 'Patient'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email || 'patient@sangman.com'}
              </p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== '/patient' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-500/30'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-neutral-700">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-700 w-full mb-2"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button
            onClick={() => {
              logout()
              router.push('/auth/login?role=patient')
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">{children}</main>

      {/* Location Permission Modal - Shows once on first visit */}
      <LocationPermission 
        showOnMount={true}
        variant="modal"
        onSuccess={(location) => {
          console.log('Location granted:', location)
        }}
      />
    </div>
  )
}
