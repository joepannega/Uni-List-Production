'use client'

import { useState } from 'react'

interface Props {
  categories: string[]      // existing categories from DB
  defaultValue?: string     // pre-selected value when editing
}

const SUGGESTED = [
  'Getting Started',
  'IT Setup',
  'Accommodation',
  'Visa & Immigration',
  'Documents',
  'Academic Preparation',
  'Student Life',
  'Settling In',
]

export default function CategorySelect({ categories, defaultValue }: Props) {
  // Merge DB categories with suggestions, dedup, keep order
  const options = [
    ...categories,
    ...SUGGESTED.filter((s) => !categories.includes(s)),
  ]

  const isNew = defaultValue && !options.includes(defaultValue)
  const [mode, setMode] = useState<'existing' | 'new'>(isNew ? 'new' : 'existing')
  const [selected, setSelected] = useState(isNew ? '' : (defaultValue ?? ''))
  const [newText, setNewText] = useState(isNew ? (defaultValue ?? '') : '')

  // The value that gets submitted with the form
  const value = mode === 'new' ? newText.trim() : selected

  return (
    <div className="space-y-2">
      {/* Hidden input carries the final value */}
      <input type="hidden" name="category" value={value} />

      {mode === 'existing' ? (
        <select
          value={selected}
          onChange={(e) => {
            if (e.target.value === '__new__') {
              setMode('new')
              setNewText('')
            } else {
              setSelected(e.target.value)
            }
          }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">No category</option>
          {options.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
          <option disabled>──────────────</option>
          <option value="__new__">+ New category…</option>
        </select>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Enter category name"
            autoFocus
            className="flex-1 border border-blue-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => {
              setMode('existing')
              setSelected('')
              setNewText('')
            }}
            className="text-sm text-gray-500 hover:text-gray-700 px-2"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
