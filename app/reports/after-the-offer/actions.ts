'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { upsertHubspotContact } from '@/lib/hubspot'
import { sendWhitepaperEmail } from '@/lib/email'
import { createDownloadToken } from '@/lib/lead-token'

const REPORT = 'after-the-offer'
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export type LeadState = { error?: string }

export async function submitLead(
  _prev: LeadState,
  formData: FormData
): Promise<LeadState> {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const company = String(formData.get('company') ?? '').trim()
  const consent = formData.get('consent') === 'on'

  // Honeypot: bots fill hidden fields; humans leave them empty.
  if (String(formData.get('website') ?? '')) return { error: 'Something went wrong. Please try again.' }

  if (!name || !email || !company) {
    return { error: 'Please fill in your name, institution, and email.' }
  }
  if (!EMAIL_RE.test(email)) {
    return { error: 'Please enter a valid email address.' }
  }
  if (!consent) {
    return { error: 'Please agree to receive the whitepaper to continue.' }
  }

  // Push to HubSpot (upsert by email). Non-fatal: we still capture the lead
  // locally even if the CRM call fails, so nothing is ever lost.
  const [firstname, ...rest] = name.split(' ')
  const lastname = rest.join(' ')
  const hs = await upsertHubspotContact({
    email,
    firstname,
    lastname: lastname || undefined,
    company,
    reportRequested: 'After the offer (2025)',
  })
  if (!hs.ok) console.error('HubSpot upsert failed:', hs.error)

  // Save our own copy (service-role client bypasses RLS).
  const admin = createAdminClient()
  const { error: dbError } = await admin.from('leads').insert({
    name,
    email,
    company,
    report: REPORT,
    consent,
    source: `landing:${REPORT}`,
    hubspot_synced: hs.ok,
  })
  if (dbError) console.error('Lead insert failed:', dbError.message)

  // Email the report link (non-fatal — the thank-you page also gives instant access).
  const token = createDownloadToken(email)
  try {
    await sendWhitepaperEmail({ to: email, name, token })
  } catch (err) {
    console.error('Whitepaper email failed:', err)
  }

  redirect(`/reports/after-the-offer/thank-you?token=${encodeURIComponent(token)}`)
}
