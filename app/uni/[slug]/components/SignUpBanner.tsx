'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function SignUpBanner({ slug }: { slug: string }) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-lg mx-auto bg-gray-900 text-white rounded-2xl px-5 py-4 shadow-2xl flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Track your progress for free</p>
          <p className="text-xs text-gray-400 mt-0.5">Sign up to tick off tasks and get a checklist personalised to you.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/uni/${slug}/register`}
            className="bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            Get started
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="text-gray-500 hover:text-gray-300 transition-colors p-1"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
