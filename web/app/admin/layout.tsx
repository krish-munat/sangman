'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  UserCheck,
  Users,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Heart,
  Moon,
  Sun,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout, isAuthenticated } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
    if (savedTheme) {
      setTheme(savedTheme)
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
    }
  }, [])

  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/auth/login?role=admin')
    }
  }, [mounted, isAuthenticated, user, router])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    if (mounted) {
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      localStorage.setItem('theme', newTheme)
    }
  }

  const navItems = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/verification', icon: UserCheck, label: 'Verification' },
    { href: '/admin/doctors', icon: UserCheck, label: 'Doctors' },
    { href: '/admin/patients', icon: Users, label: 'Patients' },
    { href: '/admin/appointments', icon: Calendar, label: 'Appointments' },
    { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/admin/config', icon: Settings, label: 'Configuration' },
  ]

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 z-50">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center space-x-2">
            <Heart className="w-8 h-8 text-primary-500" />
            <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              SANGMAN
            </span>
            <span className="text-xs bg-emergency-500 text-white px-2 py-0.5 rounded">
              ADMIN
            </span>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
          <button
            onClick={() => {
              logout()
              router.push('/auth/login?role=admin')
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64">{children}</main>
    </div>
  )
}

