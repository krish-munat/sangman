'use client'

export default function PatientError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
        <button
          onClick={() => reset()}
          className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
