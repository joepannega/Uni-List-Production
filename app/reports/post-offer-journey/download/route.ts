import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyDownloadToken } from '@/lib/lead-token'

// Serves the guide behind a signed token via a short-lived Supabase Storage
// signed URL, so the storage path is never exposed and links can't be shared
// forever.

const BUCKET = 'lead-magnets'
const OBJECT = 'post-offer-journey.pdf'

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
    .createSignedUrl(OBJECT, 60 * 60, {
      download: 'Designing the post-offer journey - Uni-Life.pdf',
    })

  if (error || !data) {
    console.error('Signed URL error:', error?.message)
    return new NextResponse('The file is temporarily unavailable.', { status: 500 })
  }

  return NextResponse.redirect(data.signedUrl)
}
