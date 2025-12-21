import { Heart } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="relative">
          <Heart className="w-16 h-16 text-primary-500 animate-pulse mx-auto" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        </div>
        <p className="mt-6 text-neutral-600 dark:text-neutral-400 font-medium">
          Loading SANGMAN...
        </p>
      </div>
    </div>
  )
}

