'use client'

import { useState } from 'react'

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors
        border-blue-200 text-blue-600 hover:bg-blue-50 active:scale-95"
    >
      {copied ? '✓ Copied!' : 'Copy link'}
    </button>
  )
}
