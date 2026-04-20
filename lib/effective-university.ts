/**
 * Returns the university ID the current user should be scoped to.
 *
 * For regular admins: their own profile.university_id.
 * For super admins in "view as" mode: the university from the super_viewing_as cookie.
 * For super admins not in view mode: their own university_id (fallback).
 */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function getEffectiveUniversityId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role, university_id')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/admin/login')

  if (profile.role === 'super_admin') {
    const cookieStore = await cookies()
    const viewingAs = cookieStore.get('super_viewing_as')?.value
    if (viewingAs) return viewingAs
  }

  if (!profile.university_id) redirect('/admin/login')
  return profile.university_id
}
