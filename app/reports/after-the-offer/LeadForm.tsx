'use client'

import { useActionState } from 'react'
import { submitLead, type LeadState } from './actions'

const initialState: LeadState = {}

export default function LeadForm() {
  const [state, action, pending] = useActionState(submitLead, initialState)

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="name" className="ul-label">
          Full name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="ul-input"
          placeholder="Jane Doe"
        />
      </div>

      <div>
        <label htmlFor="company" className="ul-label">
          University / institution
        </label>
        <input
          id="company"
          name="company"
          type="text"
          required
          autoComplete="organization"
          className="ul-input"
          placeholder="University of Amsterdam"
        />
      </div>

      <div>
        <label htmlFor="email" className="ul-label">
          Work email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="ul-input"
          placeholder="jane.doe@university.edu"
        />
      </div>

      {/* Honeypot — hidden from real users, catches bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="flex items-start gap-2.5 text-xs ul-fg2 leading-relaxed cursor-pointer">
        <input name="consent" type="checkbox" className="ul-check" />
        <span>
          I agree to receive this whitepaper and occasional related insights from Uni-Life.
          You can unsubscribe at any time.
        </span>
      </label>

      {state.error && (
        <p className="text-sm ul-accent" role="alert">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="ul-btn w-full">
        {pending ? 'Sending…' : 'Get the Whitepaper →'}
      </button>

      <p className="text-center text-xs ul-muted">
        Instant access · no spam · unsubscribe anytime
      </p>
    </form>
  )
}
