'use client'

export default function AuthError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50 p-4">
      <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Error</h2>
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
