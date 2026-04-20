import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Verify the caller is a super_admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/admin/login', _req.url))

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') {
    return NextResponse.redirect(new URL('/admin/login', _req.url))
  }

  // Verify the university exists
  const admin = createAdminClient()
  const { data: university } = await admin
    .from('universities')
    .select('id')
    .eq('id', id)
    .single()

  if (!university) return NextResponse.redirect(new URL('/super', _req.url))

  // Set the viewing-as cookie and redirect into the admin panel
  const response = NextResponse.redirect(new URL('/admin/tasks', _req.url))
  response.cookies.set('super_viewing_as', id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    // Session cookie — clears when browser closes, or on explicit exit
  })
  return response
}
