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
}

export async function upsertHubspotContact(
  contact: HubspotContact
): Promise<{ ok: boolean; error?: string }> {
  if (!HUBSPOT_TOKEN) {
    return { ok: false, error: 'HUBSPOT_TOKEN is not set' }
  }

  const properties: Record<string, string> = { email: contact.email }
  if (contact.firstname) properties.firstname = contact.firstname
  if (contact.lastname) properties.lastname = contact.lastname
  if (contact.company) properties.company = contact.company

  try {
    const res = await fetch(
      'https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HUBSPOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: [{ idProperty: 'email', id: contact.email, properties }],
        }),
      }
    )

    if (!res.ok) {
      const body = await res.text()
      return { ok: false, error: `HubSpot ${res.status}: ${body.slice(0, 500)}` }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}
