'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-sm">
        <p className="text-5xl mb-4">⚠️</p>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-sm text-gray-500 mb-8">
          An unexpected error occurred. Please try again, or contact support if the problem persists.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="bg-blue-600 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Go home
          </a>
        </div>
      </div>
    </main>
  )
}
