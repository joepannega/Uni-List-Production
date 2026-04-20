'use client'

import { useState } from 'react'

interface Props {
  url: string
  universityName: string
}

export default function ShareLinkButton({ url, universityName }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    // Use native share sheet on mobile (iOS/Android)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${universityName} arrival checklist`,
          text: 'Everything I need to do before arriving — all in one place.',
          url,
        })
        return
      } catch {
        // User cancelled share — do nothing
        return
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Final fallback: open mailto
      const subject = encodeURIComponent(`${universityName} arrival checklist`)
      const body = encodeURIComponent(
        `Here's my arrival checklist for ${universityName}:\n\n${url}\n\nBookmark this link so you can always come back to it.`
      )
      window.location.href = `mailto:?subject=${subject}&body=${body}`
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 text-sm text-blue-700 hover:text-blue-900 font-medium transition-colors px-2 py-2"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
      {copied ? 'Link copied!' : 'Save this link'}
    </button>
  )
}
