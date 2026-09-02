// Notion integration — mirrors each inbound lead into the "Report Landing Page
// Leads" database, so the team has a friendly view alongside HubSpot/Supabase.
//
// Requires a Notion internal integration token (NOTION_TOKEN) that has been
// shared with the database. The database id defaults to the one we created and
// can be overridden with NOTION_LEADS_DB_ID.

const NOTION_TOKEN = process.env.NOTION_TOKEN
const NOTION_LEADS_DB_ID =
  process.env.NOTION_LEADS_DB_ID ?? 'f86ff10b-465c-4d66-a788-4c0f0d8e31e0'
const NOTION_VERSION = '2022-06-28'

const REPORT_NAMES: Record<string, string> = {
  'after-the-offer': 'After the offer',
  'post-offer-journey': 'Designing the post-offer journey',
}

export type NotionLead = {
  name: string
  email: string
  company: string
  report: string // slug, e.g. 'after-the-offer'
  source: string
  consent: boolean
  hubspotSynced: boolean
  submittedAt?: string // ISO 8601
}

function richText(value: string) {
  return value ? [{ text: { content: value.slice(0, 2000) } }] : []
}

export async function createNotionLead(
  lead: NotionLead
): Promise<{ ok: boolean; error?: string }> {
  if (!NOTION_TOKEN) {
    return { ok: false, error: 'NOTION_TOKEN is not set' }
  }

  const properties: Record<string, unknown> = {
    Name: { title: richText(lead.name || '(no name)') },
    Email: { email: lead.email },
    Institution: { rich_text: richText(lead.company) },
    Report: { select: { name: REPORT_NAMES[lead.report] ?? lead.report } },
    Source: { rich_text: richText(lead.source) },
    Consent: { checkbox: !!lead.consent },
    'HubSpot synced': { checkbox: !!lead.hubspotSynced },
    Test: { checkbox: false },
  }
  if (lead.submittedAt) {
    properties.Submitted = { date: { start: lead.submittedAt } }
  }

  try {
    const res = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { database_id: NOTION_LEADS_DB_ID },
        properties,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      return { ok: false, error: `Notion ${res.status}: ${body.slice(0, 500)}` }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}
