'use client'

import { useState, useEffect, useRef } from 'react'
import { Globe, ChevronDown, Check } from 'lucide-react'

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇮🇳' },
]

export default function SimpleLanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState('en')
  const [isLoaded, setIsLoaded] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside as any)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside as any)
    }
  }, [isOpen])

  useEffect(() => {
    // Get saved language from localStorage
    const savedLang = localStorage.getItem('selectedLanguage') || 'en'
    setCurrentLang(savedLang)

    // Load Google Translate script
    const addScript = () => {
      const script = document.createElement('script')
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      script.async = true
      document.body.appendChild(script)
    }

    // Initialize Google Translate
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,hi,mr,gu,ta,te,bn,kn,ml,pa,or,as,ur',
          autoDisplay: false,
        },
        'google_translate_element_hidden'
      )
      setIsLoaded(true)

      // Auto-apply saved language after Google Translate loads
      if (savedLang !== 'en') {
        setTimeout(() => {
          const select = document.querySelector('.goog-te-combo') as HTMLSelectElement
          if (select) {
            select.value = savedLang
            select.dispatchEvent(new Event('change'))
          }
        }, 1000)
      }
    }

    if (!(window as any).google?.translate) {
      addScript()
    } else {
      setIsLoaded(true)
    }
  }, [])

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  const handleLanguageChange = (e: React.MouseEvent, langCode: string) => {
    e.stopPropagation()
    setCurrentLang(langCode)
    setIsOpen(false)

    // Save to localStorage
    localStorage.setItem('selectedLanguage', langCode)

    // Set Google Translate cookie
    document.cookie = `googtrans=/en/${langCode}; path=/`
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname}`

    // Trigger Google Translate
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement
    if (select) {
      select.value = langCode
      select.dispatchEvent(new Event('change'))
    }
    
    // Reload to apply translation
    setTimeout(() => {
      window.location.reload()
    }, 300)
  }

  // Handle touch scroll on the dropdown
  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation()
  }

  const currentLanguage = languages.find(l => l.code === currentLang) || languages[0]

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Hidden Google Translate Element */}
      <div id="google_translate_element_hidden" className="hidden" />

      {/* Custom Dropdown Button */}
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 
          bg-white hover:bg-gray-50 transition-all shadow-sm hover:shadow-md
          active:scale-95 touch-manipulation"
        type="button"
      >
        <Globe className="w-4 h-4 text-sky-500" />
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="text-sm font-medium text-gray-700 hidden sm:inline">{currentLanguage.nativeName}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-60 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
          style={{ zIndex: 9999 }}
        >
          <div className="p-2 border-b border-gray-100 bg-gradient-to-r from-sky-50 to-emerald-50">
            <p className="text-xs font-medium text-gray-600 px-2">Select Language / भाषा चुनें</p>
          </div>
          <div 
            ref={scrollContainerRef}
            className="max-h-72 overflow-y-auto overscroll-contain dropdown-menu"
            onTouchMove={handleTouchMove}
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={(e) => handleLanguageChange(e, lang.code)}
                type="button"
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                  touch-manipulation active:bg-sky-100
                  ${lang.code === currentLang ? 'bg-sky-50 border-l-4 border-sky-500' : 'hover:bg-gray-50 border-l-4 border-transparent'}`}
              >
                <span className="text-xl">{lang.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{lang.nativeName}</p>
                  <p className="text-xs text-gray-500">{lang.name}</p>
                </div>
                {lang.code === currentLang && (
                  <Check className="w-5 h-5 text-sky-500 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

