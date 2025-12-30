'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    google: any
    googleTranslateElementInit: () => void
  }
}

export default function GoogleTranslate() {
  useEffect(() => {
    // Define the initialization function
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,hi,mr,gu,ta,te,bn,kn,ml,pa,ur',
          layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
          autoDisplay: false,
        },
        'google_translate_element'
      )
    }

    // Check if script is already loaded
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script')
      script.id = 'google-translate-script'
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      script.async = true
      document.body.appendChild(script)
    } else if (window.google && window.google.translate) {
      // If script already loaded, reinitialize
      window.googleTranslateElementInit()
    }

    return () => {
      // Cleanup
      const element = document.getElementById('google_translate_element')
      if (element) {
        element.innerHTML = ''
      }
    }
  }, [])

  return (
    <div 
      id="google_translate_element" 
      className="google-translate-container"
    />
  )
}






