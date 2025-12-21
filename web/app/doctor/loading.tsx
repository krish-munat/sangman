import { Loader2 } from 'lucide-react'

export default function DoctorLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
        <p className="text-neutral-600 dark:text-neutral-400">Loading...</p>
      </div>
    </div>
  )
}

