import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyDownloadToken } from '@/lib/lead-token'

// Serves the whitepaper behind a signed token. The PDF lives in a private
// Supabase Storage bucket; we mint a short-lived signed URL per request so the
// underlying storage path is never exposed and links can't be shared forever.

const BUCKET = 'lead-magnets'
const OBJECT = 'after-the-offer.pdf'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token || !verifyDownloadToken(token)) {
    return new NextResponse('This download link is invalid or has expired.', {
      status: 403,
    })
  }

  const admin = createAdminClient()
  const { data, error } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(OBJECT, 60 * 60, { download: 'After the offer - Uni-Life.pdf' })

  if (error || !data) {
    console.error('Signed URL error:', error?.message)
    return new NextResponse('The file is temporarily unavailable.', { status: 500 })
  }

  return NextResponse.redirect(data.signedUrl)
}
