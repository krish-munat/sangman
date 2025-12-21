'use client'

import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl'
import { useLanguageStore } from '@/lib/store/languageStore'
import { useEffect, useState } from 'react'

// Import all messages
import enMessages from '@/messages/en.json'
import hiMessages from '@/messages/hi.json'
import mrMessages from '@/messages/mr.json'

const messages: Record<string, AbstractIntlMessages> = {
  en: enMessages,
  hi: hiMessages,
  mr: mrMessages,
}

interface IntlClientProviderProps {
  children: React.ReactNode
}

export function IntlClientProvider({ children }: IntlClientProviderProps) {
  const { locale, isHydrated } = useLanguageStore()
  const [currentMessages, setCurrentMessages] = useState<AbstractIntlMessages>(enMessages)

  useEffect(() => {
    if (isHydrated && messages[locale]) {
      setCurrentMessages(messages[locale])
    }
  }, [locale, isHydrated])

  return (
    <NextIntlClientProvider 
      locale={locale} 
      messages={currentMessages}
      timeZone="Asia/Kolkata"
    >
      {children}
    </NextIntlClientProvider>
  )
}

