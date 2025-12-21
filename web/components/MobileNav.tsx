'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Menu, 
  X, 
  Heart, 
  Sparkles, 
  Building2, 
  Stethoscope, 
  LogIn, 
  UserPlus,
  Globe,
  ChevronRight,
  Phone,
  Mail
} from 'lucide-react'
import SimpleLanguageSwitcher from './SimpleLanguageSwitcher'

interface NavLink {
  href: string
  label: string
  icon: React.ReactNode
  description?: string
}

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const navLinks: NavLink[] = [
    {
      href: '#features',
      label: 'Features',
      icon: <Sparkles className="w-5 h-5" />,
      description: 'Explore our platform features'
    },
    {
      href: '#why-us',
      label: 'Why Sangman',
      icon: <Heart className="w-5 h-5" />,
      description: 'Why choose us'
    },
    {
      href: '#hospitals',
      label: 'For Hospitals',
      icon: <Building2 className="w-5 h-5" />,
      description: 'Hospital partnership'
    },
    {
      href: '/auth/login?role=doctor',
      label: 'Doctor Login',
      icon: <Stethoscope className="w-5 h-5" />,
      description: 'Access doctor portal'
    },
  ]

  const handleLinkClick = () => {
    setIsOpen(false)
  }

  if (!mounted) return null

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel - Slides from right */}
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" fill="white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
                  SANGMAN
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Language Switcher - Prominent at top */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-sky-50 to-emerald-50">
              <div className="flex items-center gap-3 mb-2">
                <Globe className="w-5 h-5 text-sky-600" />
                <span className="font-semibold text-gray-800">Change Language</span>
              </div>
              <div className="mt-2">
                <SimpleLanguageSwitcher />
              </div>
            </div>

            {/* Navigation Links */}
            <div className="p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Navigation
              </p>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleLinkClick}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-100 to-emerald-100 rounded-xl flex items-center justify-center text-sky-600 group-hover:from-sky-200 group-hover:to-emerald-200 transition-colors">
                    {link.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{link.label}</p>
                    {link.description && (
                      <p className="text-xs text-gray-500">{link.description}</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="p-4 border-t border-gray-100 space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Account
              </p>
              <Link
                href="/auth/login"
                onClick={handleLinkClick}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-sky-500 text-sky-600 font-semibold rounded-xl hover:bg-sky-50 active:bg-sky-100 transition-colors"
              >
                <LogIn className="w-5 h-5" />
                Log In
              </Link>
              <Link
                href="/auth/register"
                onClick={handleLinkClick}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-sky-600 hover:to-emerald-600 active:from-sky-700 active:to-emerald-700 transition-colors shadow-lg"
              >
                <UserPlus className="w-5 h-5" />
                Create Account
              </Link>
            </div>

            {/* Contact Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Need Help?
              </p>
              <div className="flex items-center gap-4">
                <a 
                  href="tel:+911234567890" 
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-sky-600"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Us</span>
                </a>
                <a 
                  href="mailto:support@sangman.in" 
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-sky-600"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

