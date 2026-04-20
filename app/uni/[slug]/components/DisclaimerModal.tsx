'use client'

import { useState, useTransition } from 'react'
import { acknowledgeDisclaimer } from '@/app/uni/[slug]/actions'

interface Props {
  universityName: string
  slug: string
}

export default function DisclaimerModal({ universityName, slug }: Props) {
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

  if (done) return null

  function handleAccept() {
    startTransition(async () => {
      await acknowledgeDisclaimer(slug)
      setDone(true)
    })
  }

  return (
    /* Outer overlay — no onClick so clicking the backdrop does nothing */
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        /* Stop clicks inside the card from bubbling to the overlay (safety measure) */
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-4 flex items-start gap-3">
          <span className="text-2xl shrink-0" aria-hidden>⚠️</span>
          <div>
            <p className="text-sm font-bold text-amber-900">Important notice</p>
            <p className="text-xs text-amber-700 mt-0.5">Please read before continuing</p>
          </div>
        </div>

        {/* Body — scrollable in case text is tall on small screens */}
        <div className="px-6 py-5 max-h-[55vh] overflow-y-auto">
          <p className="text-sm text-gray-700 leading-relaxed">
            This is not the official checklist created by{' '}
            <strong className="text-gray-900">{universityName}</strong>. It has been developed by the
            Uni-Life team to help you gain a clear overview of all relevant tasks.
          </p>
          <p className="text-sm text-gray-700 leading-relaxed mt-3">
            While the steps are based on documentation provided by{' '}
            <strong className="text-gray-900">{universityName}</strong>, you should always verify that no
            steps are missed and that each one is completed correctly.
          </p>
          <p className="text-sm text-gray-700 leading-relaxed mt-3">
            Uni-Life does not accept responsibility for any errors, omissions, or incomplete tasks.
          </p>
          <p className="text-sm text-gray-700 leading-relaxed mt-3">
            Please always contact{' '}
            <strong className="text-gray-900">{universityName}</strong>{' '}
            in case of any uncertainties.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handleAccept}
            disabled={isPending}
            className="w-full bg-gray-900 hover:bg-gray-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Saving…
              </>
            ) : (
              'I understand and accept'
            )}
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">
            You must accept to continue using this checklist.
          </p>
        </div>
      </div>
    </div>
  )
}
