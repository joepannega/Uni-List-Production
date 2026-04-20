import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function login(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error || !data.user) {
    redirect('/admin/login?error=Invalid+email+or+password')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single()

  if (profile?.role === 'super_admin') redirect('/super')
  if (profile?.role === 'admin') redirect('/admin/tasks')
  redirect('/admin/login?error=No+admin+account+found')
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string }>
}) {
  const params = await searchParams

  // If already logged in, redirect appropriately
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (profile?.role === 'super_admin') redirect('/super')
    if (profile?.role === 'admin') redirect('/admin/tasks')
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Uni-List</h1>
          <p className="text-gray-500 mt-1 text-sm">Admin sign in</p>
        </div>

        <form action={login} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          {params.reset && (
            <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">Password updated — please sign in with your new password.</p>
          )}
          {params.error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{params.error}</p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  )
}
