import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { NATIONALITIES } from '@/lib/nationalities'
import DeleteButton from '@/app/admin/components/DeleteButton'
import { sendAdminPasswordResetEmail } from '@/lib/email'

export default async function ManageUniversityPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const admin = createAdminClient()

  const { data: university } = await admin
    .from('universities')
    .select('id, name, slug, home_country')
    .eq('id', id)
    .single()

  if (!university) notFound()

  const { data: admins } = await admin
    .from('users')
    .select('id, email, role, created_at')
    .eq('university_id', id)
    .in('role', ['admin', 'super_admin'])
    .order('email')

  async function updateUniversity(formData: FormData) {
    'use server'
    const name = (formData.get('name') as string).trim()
    const slug = (formData.get('slug') as string).trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')
    const home_country = (formData.get('home_country') as string).trim()
    const admin = createAdminClient()
    const { error } = await admin.from('universities').update({ name, slug, home_country }).eq('id', id)
    if (error) {
      redirect(`/super/universities/${id}?error=${encodeURIComponent(error.message)}`)
    }
    redirect(`/super/universities/${id}?success=Saved`)
  }

  async function addAdmin(formData: FormData) {
    'use server'
    const email = (formData.get('email') as string).trim()
    const password = (formData.get('password') as string)

    const admin = createAdminClient()

    // Create auth user via admin API
    const { data: created, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError || !created.user) {
      redirect(`/super/universities/${id}?error=${encodeURIComponent(authError?.message ?? 'Failed to create user')}`)
    }

    // Insert profile
    const { error: insertError } = await admin.from('users').insert({
      id: created.user.id,
      university_id: id,
      role: 'admin',
      email,
    })

    if (insertError) {
      redirect(`/super/universities/${id}?error=${encodeURIComponent(insertError.message)}`)
    }

    redirect(`/super/universities/${id}?success=Admin+added`)
  }

  async function removeAdmin(formData: FormData) {
    'use server'
    const userId = formData.get('user_id') as string
    const admin = createAdminClient()
    await admin.from('users').delete().eq('id', userId)
    await admin.auth.admin.deleteUser(userId)
    redirect(`/super/universities/${id}`)
  }

  async function resetAdminPassword(formData: FormData) {
    'use server'
    const email = formData.get('email') as string
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const admin = createAdminClient()

    const { data, error } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${appUrl}/auth/callback?next=/admin/reset-password`,
      },
    })

    if (error || !data?.properties?.action_link) {
      redirect(`/super/universities/${id}?error=${encodeURIComponent(error?.message ?? 'Failed to generate reset link')}`)
    }

    try {
      await sendAdminPasswordResetEmail({
        to: email,
        resetLink: data.properties.action_link,
      })
    } catch {
      redirect(`/super/universities/${id}?error=${encodeURIComponent('Reset link generated but email failed to send')}`)
    }

    redirect(`/super/universities/${id}?success=${encodeURIComponent(`Password reset email sent to ${email}`)}`)
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/super" className="text-sm text-gray-500 hover:text-gray-700">← Universities</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-900">{university.name}</span>
        </div>
        <a
          href={`/super/universities/${id}/view`}
          className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View as admin
        </a>
      </div>

      {sp.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{sp.error}</p>
      )}
      {sp.success && (
        <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{sp.success}</p>
      )}

      {/* Edit university */}
      <section>
        <h3 className="text-base font-semibold text-gray-900 mb-4">University details</h3>
        <form action={updateUniversity} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              name="name"
              type="text"
              required
              defaultValue={university.name}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL slug</label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
              <span className="px-3 py-2 text-sm text-gray-400 bg-gray-50 border-r border-gray-300">/uni/</span>
              <input
                name="slug"
                type="text"
                required
                defaultValue={university.slug}
                className="flex-1 px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Home country</label>
            <p className="text-xs text-gray-400 mb-2">Students from this nationality are treated as domestic; all others are "International".</p>
            <select
              name="home_country"
              required
              defaultValue={university.home_country ?? 'British'}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {NATIONALITIES.filter(n => n !== 'International').map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </form>
      </section>

      {/* Admin accounts */}
      <section>
        <h3 className="text-base font-semibold text-gray-900 mb-4">Admin accounts</h3>

        {admins && admins.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 mb-4">
            {admins.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex-1 text-sm text-gray-900">{a.email}</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{a.role}</span>
                {/* Password reset */}
                <form action={resetAdminPassword}>
                  <input type="hidden" name="email" value={a.email} />
                  <button
                    type="submit"
                    className="text-xs text-amber-600 hover:text-amber-800 font-medium"
                  >
                    Send reset
                  </button>
                </form>
                {/* Remove */}
                <form id={`remove-${a.id}`} action={removeAdmin}>
                  <input type="hidden" name="user_id" value={a.id} />
                </form>
                <DeleteButton formId={`remove-${a.id}`} label="Remove" confirmLabel="Remove" />
              </div>
            ))}
          </div>
        )}

        <form action={addAdmin} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <p className="text-sm font-medium text-gray-700">Add admin</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="admin@university.edu"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Password</label>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="Min. 8 characters"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Add admin
          </button>
        </form>
      </section>
    </div>
  )
}
