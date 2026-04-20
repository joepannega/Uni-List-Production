import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export default async function ForgotPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sent?: string; error?: string }>
}) {
  const { slug } = await params
  const sp = await searchParams

  async function sendReset(formData: FormData) {
    'use server'
    const email = (formData.get('email') as string).trim()
    const supabase = await createClient()
    const headersList = await headers()
    const host = headersList.get('host') ?? 'localhost:3000'
    const protocol = host.startsWith('localhost') ? 'http' : 'https'
    const origin = `${protocol}://${host}`

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/uni/${slug}/reset-password`,
    })
    // Always show success — don't reveal whether the email exists
    redirect(`/uni/${slug}/forgot-password?sent=1`)
  }

  if (sp.sent) {
    return (
      <div className="max-w-sm mx-auto text-center">
        <div className="text-4xl mb-4">✉️</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
        <p className="text-sm text-gray-500 mb-6">
          If an account exists for that address, we've sent a password reset link. Check your inbox (and spam folder).
        </p>
        <Link href={`/uni/${slug}/login`} className="text-sm text-blue-600 hover:underline">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Forgot password</h2>
      <p className="text-sm text-gray-500 mb-6">
        Enter your email and we'll send you a link to reset your password.
      </p>

      <form action={sendReset} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        {sp.error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{sp.error}</p>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Send reset link
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-4">
        <Link href={`/uni/${slug}/login`} className="text-blue-600 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
