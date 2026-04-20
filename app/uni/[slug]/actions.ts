'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function acknowledgeDisclaimer(slug: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('users')
    .update({ disclaimer_acknowledged: true })
    .eq('id', user.id)

  revalidatePath(`/uni/${slug}/dashboard`)
}
