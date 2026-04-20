'use client'

import { useState } from 'react'

interface Props {
  intakes: string[]       // existing intakes already used across tasks
  defaultValue?: string   // pre-selected value when editing
}

export default function IntakeSelect({ intakes, defaultValue }: Props) {
  const isNew = !!defaultValue && !intakes.includes(defaultValue)
  const [mode, setMode] = useState<'existing' | 'new'>(isNew ? 'new' : 'existing')
  const [selected, setSelected] = useState(isNew ? '' : (defaultValue ?? ''))
  const [newText, setNewText] = useState(isNew ? (defaultValue ?? '') : '')

  const value = mode === 'new' ? newText.trim() : selected

  return (
    <div className="space-y-2">
      <input type="hidden" name="intake" value={value} />

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
          <option value="">All intakes (visible to everyone)</option>
          {intakes.map((intake) => (
            <option key={intake} value={intake}>{intake}</option>
          ))}
          <option disabled>──────────────</option>
          <option value="__new__">+ New intake…</option>
        </select>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="e.g. September 2026"
            autoFocus
            className="flex-1 text-sm border border-blue-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => { setMode('existing'); setNewText('') }}
            className="text-sm text-gray-500 hover:text-gray-700 px-2"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
