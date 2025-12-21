'use client'

import { useState, useEffect } from 'react'
import { Globe, ChevronDown, Check } from 'lucide-react'

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
]

export default function SimpleLanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState('en')
  const [isLoaded, setIsLoaded] = useState(false)

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
          includedLanguages: 'en,hi,mr,gu,ta,te,bn',
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

  const handleLanguageChange = (langCode: string) => {
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

  const currentLanguage = languages.find(l => l.code === currentLang) || languages[0]

  return (
    <div className="relative">
      {/* Hidden Google Translate Element */}
      <div id="google_translate_element_hidden" className="hidden" />

      {/* Custom Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 
          bg-white hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
      >
        <Globe className="w-4 h-4 text-sky-500" />
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="text-sm font-medium text-gray-700 hidden sm:inline">{currentLanguage.nativeName}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-2 border-b border-gray-100 bg-gray-50">
              <p className="text-xs font-medium text-gray-500 px-2">Select Language / भाषा चुनें</p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-sky-50 transition-colors
                    ${lang.code === currentLang ? 'bg-sky-50' : ''}`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{lang.nativeName}</p>
                    <p className="text-xs text-gray-500">{lang.name}</p>
                  </div>
                  {lang.code === currentLang && (
                    <Check className="w-4 h-4 text-sky-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

