import { Loader2, Heart } from 'lucide-react'

export default function AuthLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Heart className="w-10 h-10 text-primary-500" />
          <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">SANGMAN</span>
        </div>
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
        <p className="text-neutral-600 dark:text-neutral-400">Preparing secure login...</p>
      </div>
    </div>
  )
}

