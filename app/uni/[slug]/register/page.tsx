import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { NATIONALITIES } from '@/lib/nationalities'

export default async function RegisterStep1Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { slug } = await params
  const sp = await searchParams

  const admin = createAdminClient()

  const { data: university } = await admin
    .from('universities')
    .select('id')
    .eq('slug', slug)
    .single()

  // Fetch distinct intakes already used in this university's tasks
  const intakes: string[] = []
  if (university) {
    const { data: intakeRows } = await admin
      .from('tasks')
      .select('intake')
      .eq('university_id', university.id)
      .not('intake', 'is', null)

    const unique = [...new Set((intakeRows ?? []).map((r) => r.intake as string))].sort()
    intakes.push(...unique)
  }

  async function saveStep1(formData: FormData) {
    'use server'
    const email       = (formData.get('email') as string).trim()
    const nationality = (formData.get('nationality') as string).trim()
    const intake      = (formData.get('intake') as string | null)?.trim() || null

    if (!nationality) {
      redirect(`/uni/${slug}/register?error=Please+select+your+nationality`)
    }

    const admin = createAdminClient()
    const { data: university } = await admin
      .from('universities')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!university) redirect(`/uni/${slug}`)

    const cookieStore = await cookies()
    cookieStore.set(
      'reg_draft',
      JSON.stringify({ email, nationality, intake, university_id: university.id }),
      { maxAge: 600, path: '/', httpOnly: true, sameSite: 'lax' }
    )
    redirect(`/uni/${slug}/register/password`)
  }

  return (
    <div className="max-w-sm mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Create your account</h2>
        <p className="text-sm text-gray-500 mt-1">Step 1 of 2 — your details</p>
      </div>

      <form action={saveStep1} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        {sp.error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{sp.error}</p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1.5">So you can log back in and pick up where you left off.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
          <select
            name="nationality"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Select your nationality…</option>
            {NATIONALITIES.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1.5">So we only show you the steps relevant to you — visa requirements differ by country.</p>
        </div>

        {/* Only show intake selector if the university has defined intakes on tasks */}
        {intakes.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Intake</label>
            <select
              name="intake"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select your intake…</option>
              {intakes.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1.5">So we only show tasks relevant to when you're arriving.</p>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Continue
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-4">
        Already have an account?{' '}
        <Link href={`/uni/${slug}/login`} className="text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
