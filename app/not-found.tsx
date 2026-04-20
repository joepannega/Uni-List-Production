import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-sm">
        <p className="text-6xl font-bold text-gray-200 mb-4">404</p>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-sm text-gray-500 mb-8">
          This page doesn't exist or may have been moved.
        </p>
        <Link
          href="/"
          className="inline-block bg-blue-600 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Go home
        </Link>
      </div>
    </main>
  )
}
