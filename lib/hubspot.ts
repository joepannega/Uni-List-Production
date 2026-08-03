// HubSpot CRM integration.
// Upserts a contact by email using the v3 batch upsert endpoint, so a repeat
// submission updates the existing contact instead of creating a duplicate.
//
// Requires a Private App token with the `crm.objects.contacts.write` scope,
// set as HUBSPOT_TOKEN in the environment.

const HUBSPOT_TOKEN = process.env.HUBSPOT_TOKEN

export type HubspotContact = {
  email: string
  firstname?: string
  lastname?: string
  company?: string
  // Custom property stamped on form leads so they can be segmented into a
  // HubSpot list (e.g. "After the offer (2025)"). Requires a contact property
  // with internal name `report_requested` to exist in HubSpot.
  reportRequested?: string
}

async function upsertOnce(
  email: string,
  properties: Record<string, string>
): Promise<{ ok: boolean; status: number; body: string }> {
  const res = await fetch(
    'https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HUBSPOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: [{ idProperty: 'email', id: email, properties }],
      }),
    }
  )
  return { ok: res.ok, status: res.status, body: res.ok ? '' : await res.text() }
}

export async function upsertHubspotContact(
  contact: HubspotContact
): Promise<{ ok: boolean; error?: string }> {
  if (!HUBSPOT_TOKEN) {
    return { ok: false, error: 'HUBSPOT_TOKEN is not set' }
  }

  const base: Record<string, string> = { email: contact.email }
  if (contact.firstname) base.firstname = contact.firstname
  if (contact.lastname) base.lastname = contact.lastname
  if (contact.company) base.company = contact.company

  const withCustom = { ...base }
  if (contact.reportRequested) withCustom.report_requested = contact.reportRequested

  try {
    let result = await upsertOnce(contact.email, withCustom)

    // If the custom property doesn't exist in HubSpot yet, HubSpot rejects the
    // whole request. Retry without it so the contact still syncs (the lead is
    // never lost just because `report_requested` hasn't been created).
    if (
      !result.ok &&
      contact.reportRequested &&
      /report_requested|does not exist|PROPERTY_DOESNT_EXIST/i.test(result.body)
    ) {
      console.warn(
        'HubSpot: property `report_requested` not found — syncing contact without it.'
      )
      result = await upsertOnce(contact.email, base)
    }

    if (!result.ok) {
      return { ok: false, error: `HubSpot ${result.status}: ${result.body.slice(0, 500)}` }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}
