import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { IntlClientProvider } from '@/components/providers/IntlClientProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SANGMAN - Your Trusted Healthcare Partner',
  description: 'Connect with verified doctors, book appointments, and manage your health with SANGMAN',
  keywords: ['healthcare', 'doctor', 'appointment', 'telemedicine', 'medical'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider>
            <IntlClientProvider>
              <div className="bg-white dark:bg-slate-900 min-h-screen">
                {children}
              </div>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#fff',
                    color: '#171717',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </IntlClientProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
