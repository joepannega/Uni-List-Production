import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ code?: string; error?: string }>
}) {
  const { slug } = await params
  const sp = await searchParams

  // Exchange the one-time code for a session (sets cookie), then clean up the URL
  if (sp.code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(sp.code)
    if (error) {
      redirect(`/uni/${slug}/forgot-password?error=This+reset+link+has+expired+or+already+been+used`)
    }
    redirect(`/uni/${slug}/reset-password`)
  }

  async function updatePassword(formData: FormData) {
    'use server'
    const password = formData.get('password') as string
    const confirm = formData.get('confirm') as string
    if (password !== confirm) {
      redirect(`/uni/${slug}/reset-password?error=Passwords+do+not+match`)
    }
    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) redirect(`/uni/${slug}/reset-password?error=${encodeURIComponent(error.message)}`)
    redirect(`/uni/${slug}/login?message=Password+updated.+Please+sign+in.`)
  }

  return (
    <div className="max-w-sm mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Set new password</h2>
      <p className="text-sm text-gray-500 mb-6">Choose a new password for your account.</p>

      <form action={updatePassword} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        {sp.error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{sp.error}</p>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="Min. 8 characters"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
          <input
            name="confirm"
            type="password"
            required
            minLength={8}
            placeholder="Repeat your password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Update password
        </button>
      </form>
    </div>
  )
}
