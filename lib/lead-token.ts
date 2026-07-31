// Lightweight signed tokens for gating report downloads.
// A token binds an email to an expiry and is HMAC-signed, so the download
// link can't be forged or guessed — but it's stateless (no DB lookup needed).
//
// The signing secret defaults to the Supabase service-role key (already secret
// and server-only). Set LEAD_DOWNLOAD_SECRET to use a dedicated secret instead.

import crypto from 'node:crypto'

const SECRET =
  process.env.LEAD_DOWNLOAD_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'insecure-dev-secret'

const TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

function sign(payload: string): string {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('base64url')
}

export function createDownloadToken(email: string): string {
  const payload = `${email}|${Date.now() + TTL_MS}`
  const encoded = Buffer.from(payload).toString('base64url')
  return `${encoded}.${sign(payload)}`
}

export function verifyDownloadToken(token: string): { email: string } | null {
  const [encoded, sig] = token.split('.')
  if (!encoded || !sig) return null

  let payload: string
  try {
    payload = Buffer.from(encoded, 'base64url').toString()
  } catch {
    return null
  }

  const expected = sign(payload)
  const sigBuf = Buffer.from(sig)
  const expectedBuf = Buffer.from(expected)
  if (sigBuf.length !== expectedBuf.length) return null
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null

  const [email, expStr] = payload.split('|')
  if (!email || !expStr) return null
  if (Number(expStr) < Date.now()) return null

  return { email }
}
