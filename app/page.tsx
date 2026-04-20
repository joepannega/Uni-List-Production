import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role, university_id')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'super_admin') redirect('/super')
    if (profile?.role === 'admin') redirect('/admin/tasks')

    if (profile?.role === 'student' && profile.university_id) {
      const admin = createAdminClient()
      const { data: uni } = await admin
        .from('universities')
        .select('slug')
        .eq('id', profile.university_id)
        .single()
      if (uni) redirect(`/uni/${uni.slug}/dashboard`)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-sm px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Uni-List</h1>
        <p className="text-gray-500 mb-6">Your university arrival checklist</p>
        <p className="text-sm text-gray-400">
          Visit your university's sign-in link to get started,
          e.g. <span className="font-mono text-gray-500">/uni/kent/login</span>
        </p>
      </div>
    </main>
  )
}
