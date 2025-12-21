import Link from 'next/link'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl font-bold text-primary-500 mb-4">404</div>
        
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Page Not Found
        </h1>
        
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          
          <Link
            href="/patient/discover"
            className="flex items-center justify-center gap-2 px-6 py-3 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Search className="w-4 h-4" />
            Find Doctors
          </Link>
        </div>
      </div>
    </div>
  )
}

