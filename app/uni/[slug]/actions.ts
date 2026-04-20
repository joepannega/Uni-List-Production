'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function acknowledgeDisclaimer(slug: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('acknowledgeDisclaimer: no user session')
    return
  }

  // Use admin client to bypass RLS on the users table
  const admin = createAdminClient()
  const { error } = await admin
    .from('users')
    .update({ disclaimer_acknowledged: true })
    .eq('id', user.id)

  if (error) console.error('acknowledgeDisclaimer error:', error.message)

  revalidatePath(`/uni/${slug}/dashboard`)
}
