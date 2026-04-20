'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function acknowledgeDisclaimer(slug: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('users')
    .update({ disclaimer_acknowledged: true })
    .eq('id', user.id)

  if (error) console.error('acknowledgeDisclaimer error:', error.message)

  revalidatePath(`/uni/${slug}/dashboard`)
}
