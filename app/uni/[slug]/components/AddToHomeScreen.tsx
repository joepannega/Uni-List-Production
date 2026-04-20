'use client'

import { useState, useEffect } from 'react'

// Only show on mobile, only once (persisted in localStorage)
export default function AddToHomeScreen() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Don't show if already dismissed, or already installed as PWA
    const dismissed = localStorage.getItem('a2hs_dismissed')
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigator as any).standalone === true

    // Only show on mobile (touch device)
    const isMobile = window.matchMedia('(max-width: 768px)').matches

    if (!dismissed && !isStandalone && isMobile) {
      // Delay slightly so it doesn't fight with welcome banner
      const t = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(t)
    }
  }, [])

  function dismiss() {
    localStorage.setItem('a2hs_dismissed', '1')
    setVisible(false)
  }

  if (!visible) return null

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 mb-4 flex items-start gap-3">
      <span className="text-lg shrink-0 mt-0.5">📌</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">Save to your home screen</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
          {isIOS
            ? "Tap the share icon below, then 'Add to Home Screen' for quick access anytime."
            : "Tap your browser menu and choose 'Add to Home Screen' to keep this handy."}
        </p>
      </div>
      <button
        onClick={dismiss}
        className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors mt-0.5"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
