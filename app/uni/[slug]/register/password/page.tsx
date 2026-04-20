import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email'

export default async function RegisterStep2Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { slug } = await params
  const sp = await searchParams
  const cookieStore = await cookies()
  const draft = cookieStore.get('reg_draft')

  // If step 1 wasn't completed, go back
  if (!draft) redirect(`/uni/${slug}/register`)

  const { email } = JSON.parse(draft.value) as {
    email: string
    nationality: string
    intake: string | null
    university_id: string
  }

  async function createAccount(formData: FormData) {
    'use server'
    const password = formData.get('password') as string
    const confirm = formData.get('confirm') as string

    if (password !== confirm) {
      redirect(`/uni/${slug}/register/password?error=Passwords+do+not+match`)
    }
    if (password.length < 8) {
      redirect(`/uni/${slug}/register/password?error=Password+must+be+at+least+8+characters`)
    }

    const cookieStore = await cookies()
    const draft = cookieStore.get('reg_draft')
    if (!draft) redirect(`/uni/${slug}/register`)

    const { email, nationality, intake, university_id } = JSON.parse(draft.value) as {
      email: string
      nationality: string
      intake: string | null
      university_id: string
    }

    const supabase = await createClient()

    // Create auth user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError || !signUpData.user) {
      const msg = signUpError?.message ?? 'Registration failed'
      redirect(`/uni/${slug}/register/password?error=${encodeURIComponent(msg)}`)
    }

    // Insert profile row using admin client (bypasses RLS — user has no session yet at this point)
    const adminClient = createAdminClient()
    const { error: insertError } = await adminClient.from('users').insert({
      id: signUpData.user.id,
      university_id,
      role: 'student',
      email,
      nationality,
      intake: intake ?? null,
    })

    if (insertError) {
      redirect(`/uni/${slug}/register/password?error=${encodeURIComponent(insertError.message)}`)
    }

    // Sign in to get a session (in case email verification is required)
    await supabase.auth.signInWithPassword({ email, password })

    // Clear draft cookie
    cookieStore.delete('reg_draft')

    // Send welcome email with checklist link (fire and forget — don't block on it)
    const adminClient2 = createAdminClient()
    const { data: uni } = await adminClient2
      .from('universities')
      .select('name')
      .eq('id', university_id)
      .single()

    if (uni) {
      sendWelcomeEmail({ to: email, universityName: uni.name, slug }).catch(() => {
        // Non-fatal — student still lands on dashboard
      })
    }

    redirect(`/uni/${slug}/dashboard?welcome=1`)
  }

  return (
    <div className="max-w-sm mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Create your account</h2>
        <p className="text-sm text-gray-500 mt-1">Step 2 of 2 — set a password</p>
        <p className="text-sm text-gray-500 mt-1">Registering as <strong>{email}</strong></p>
      </div>

      <form action={createAccount} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        {sp.error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{sp.error}</p>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="At least 8 characters"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
          <input
            name="confirm"
            type="password"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Create account
        </button>
      </form>
    </div>
  )
}
