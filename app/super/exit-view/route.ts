import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest) {
  const response = NextResponse.redirect(new URL('/super', _req.url))
  response.cookies.delete('super_viewing_as')
  return response
}
