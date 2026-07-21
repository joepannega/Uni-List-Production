import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>
}) {
  const sp = await searchParams

  // Exchange the one-time recovery code for a session (sets cookie), then clean up the URL
  if (sp.code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(sp.code)
    if (error) {
      redirect('/admin/forgot-password?error=This+reset+link+has+expired+or+already+been+used')
    }
    redirect('/admin/reset-password')
  }

  async function updatePassword(formData: FormData) {
    'use server'
    const password = formData.get('password') as string
    const confirm = formData.get('confirm') as string
    if (password.length < 8) {
      redirect('/admin/reset-password?error=Password+must+be+at+least+8+characters')
    }
    if (password !== confirm) {
      redirect('/admin/reset-password?error=Passwords+do+not+match')
    }
    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) redirect(`/admin/reset-password?error=${encodeURIComponent(error.message)}`)
    await supabase.auth.signOut()
    redirect('/admin/login?reset=1')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Set new password</h1>
          <p className="text-sm text-gray-500 mt-1">Choose a strong password for your admin account.</p>
        </div>

        <form action={updatePassword} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
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
              placeholder="Repeat your new password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Save new password
          </button>
        </form>
      </div>
    </div>
  )
}
