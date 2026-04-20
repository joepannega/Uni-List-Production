import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NATIONALITIES } from '@/lib/nationalities'

export default async function SettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const { slug } = await params
  const sp = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/uni/${slug}/login`)

  const { data: profile } = await supabase
    .from('users')
    .select('email, nationality')
    .eq('id', user.id)
    .single()

  if (!profile) redirect(`/uni/${slug}/login`)

  async function updateNationality(formData: FormData) {
    'use server'
    const nationality = (formData.get('nationality') as string).trim()
    if (!nationality) redirect(`/uni/${slug}/settings?error=Please+select+a+nationality`)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect(`/uni/${slug}/login`)

    const admin = createAdminClient()
    const { error } = await admin.from('users').update({ nationality }).eq('id', user.id)
    if (error) redirect(`/uni/${slug}/settings?error=${encodeURIComponent(error.message)}`)
    redirect(`/uni/${slug}/settings?success=Nationality+updated`)
  }

  async function updateEmail(formData: FormData) {
    'use server'
    const email = (formData.get('email') as string).trim()
    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({ email })
    if (error) redirect(`/uni/${slug}/settings?error=${encodeURIComponent(error.message)}`)
    redirect(`/uni/${slug}/settings?success=Check+your+new+email+address+for+a+confirmation+link`)
  }

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect(`/uni/${slug}/login`)
  }

  return (
    <div className="max-w-sm mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <a href={`/uni/${slug}/dashboard`} className="text-sm text-gray-500 hover:text-gray-700">
          ← Back
        </a>
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
      </div>

      {sp.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{sp.error}</p>
      )}
      {sp.success && (
        <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{sp.success}</p>
      )}

      {/* Nationality */}
      <section className={`bg-white rounded-xl border p-5 ${sp.error ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200'}`}>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Nationality</h3>
        <form action={updateNationality} className="space-y-3">
          <select
            name="nationality"
            defaultValue={profile.nationality ?? ''}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Select nationality…</option>
            {NATIONALITIES.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Save nationality
          </button>
        </form>
      </section>

      {/* Email */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Email address</h3>
        <p className="text-xs text-gray-400 mb-4">Current: {profile.email}</p>
        <form action={updateEmail} className="space-y-3">
          <input
            name="email"
            type="email"
            required
            placeholder="New email address"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Update email
          </button>
        </form>
      </section>

      {/* Sign out */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Sign out</h3>
        <p className="text-xs text-gray-400 mb-4">You can sign back in at any time.</p>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full bg-gray-100 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Sign out
          </button>
        </form>
      </section>
    </div>
  )
}
