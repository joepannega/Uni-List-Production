'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { upsertHubspotContact } from '@/lib/hubspot'
import { sendReportEmail } from '@/lib/email'
import { createDownloadToken } from '@/lib/lead-token'

const REPORT = 'post-offer-journey'
const REPORT_LABEL = 'Designing the post-offer journey (2025)'
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
    return { error: 'Please agree to receive the guide to continue.' }
  }

  // Push to HubSpot (upsert by email). Non-fatal: the lead is still captured
  // locally even if the CRM call fails, so nothing is ever lost.
  const [firstname, ...rest] = name.split(' ')
  const lastname = rest.join(' ')
  const hs = await upsertHubspotContact({
    email,
    firstname,
    lastname: lastname || undefined,
    company,
    reportRequested: REPORT_LABEL,
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

  // Email the guide link (non-fatal — the thank-you page also gives instant access).
  const token = createDownloadToken(email)
  try {
    await sendReportEmail({
      to: email,
      name,
      token,
      slug: REPORT,
      subject: 'Your guide: Designing the post-offer journey',
      kicker: 'Uni-Life · How-to guide',
      headerTitle: 'The post-offer journey',
      bodyName:
        'Designing the post-offer journey — seven lessons on turning accepted students into enrolled students',
    })
  } catch (err) {
    console.error('Report email failed:', err)
  }

  redirect(`/reports/${REPORT}/thank-you?token=${encodeURIComponent(token)}`)
}
