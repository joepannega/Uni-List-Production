'use client'

import { useState } from 'react'

export default function WelcomeBanner({ name }: { name: string }) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3.5 mb-6 flex items-center gap-3">
      <span className="text-xl shrink-0">👋</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-green-800">Welcome to your checklist!</p>
        <p className="text-xs text-green-700 mt-0.5">
          Complete each step below to get ready for your arrival. You can tick items off as you go.
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 text-green-400 hover:text-green-600 transition-colors"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
