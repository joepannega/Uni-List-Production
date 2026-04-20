'use client'

import { useFormStatus } from 'react-dom'

export default function CheckboxButton({ completed }: { completed: boolean }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={`
        shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
        transition-all cursor-pointer
        ${pending
          ? 'border-gray-300 bg-gray-50'
          : completed
            ? 'bg-green-500 border-green-500 hover:bg-green-600 hover:border-green-600'
            : 'border-gray-300 hover:border-green-400'
        }
      `}
    >
      {pending ? (
        <svg className="w-3 h-3 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      ) : completed ? (
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : null}
    </button>
  )
}
