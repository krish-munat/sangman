'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useLanguageStore, type Locale } from '@/lib/store/languageStore'

const languages: { code: Locale; name: string; nativeName: string; flag: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
]

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'inline' | 'minimal'
  className?: string
}

export default function LanguageSwitcher({ variant = 'dropdown', className = '' }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { locale, setLocale } = useLanguageStore()
  const router = useRouter()
  const t = useTranslations('languages')

  const currentLanguage = languages.find(l => l.code === locale) || languages[0]

  const handleLanguageChange = (code: Locale) => {
    setLocale(code)
    setIsOpen(false)
    // Refresh to apply new locale
    router.refresh()
  }

  if (variant === 'minimal') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors border border-gray-200 dark:border-neutral-600"
          aria-label="Change language"
        >
          <Globe className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{currentLanguage.flag}</span>
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-lg z-20 overflow-hidden">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors
                    ${lang.code === locale ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{lang.nativeName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{lang.name}</p>
                  </div>
                  {lang.code === locale && (
                    <Check className="w-4 h-4 text-primary-500" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${lang.code === locale
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-600'
              }`}
          >
            {lang.flag} {lang.nativeName}
          </button>
        ))}
      </div>
    )
  }

  // Default: dropdown variant
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-600 
          bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors
          shadow-md hover:shadow-lg"
      >
        <Globe className="w-4 h-4 text-gray-500" />
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{currentLanguage.nativeName}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full mt-2 w-56 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-lg z-20 overflow-hidden">
            <div className="p-2 border-b border-gray-100 dark:border-neutral-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2">{t('selectLanguage')}</p>
            </div>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors
                  ${lang.code === locale ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
              >
                <span className="text-xl">{lang.flag}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{lang.nativeName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{lang.name}</p>
                </div>
                {lang.code === locale && (
                  <Check className="w-4 h-4 text-primary-500" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

