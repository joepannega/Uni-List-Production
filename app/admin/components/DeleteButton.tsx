'use client'

import { useState } from 'react'

export default function DeleteButton({
  formId,
  label = 'Delete',
  confirmLabel = 'Delete',
}: {
  formId: string
  label?: string
  confirmLabel?: string
}) {
  const [confirming, setConfirming] = useState(false)

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-500">Sure?</span>
        <button
          type="submit"
          form={formId}
          className="text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded transition-colors"
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-xs text-red-400 hover:text-red-600 transition-colors"
    >
      {label}
    </button>
  )
}
