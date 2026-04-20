import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function UniLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const { slug } = await params
  const sp = await searchParams

  async function login(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    })
    if (error || !data.user) {
      redirect(`/uni/${slug}/login?error=Invalid+email+or+password`)
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role, university_id')
      .eq('id', data.user.id)
      .single()

    // Verify they belong to this university
    const { data: university } = await supabase
      .from('universities')
      .select('id')
      .eq('slug', slug)
      .single()

    if (profile?.role === 'student' && profile.university_id === university?.id) {
      redirect(`/uni/${slug}/dashboard`)
    }

    // Admin/super_admin who ended up here — redirect to their area
    if (profile?.role === 'admin') redirect('/admin/tasks')
    if (profile?.role === 'super_admin') redirect('/super')

    redirect(`/uni/${slug}/login?error=Account+not+found+for+this+university`)
  }

  return (
    <div className="max-w-sm mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Sign in</h2>

      <form action={login} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        {sp.error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{sp.error}</p>
        )}
        {sp.message && (
          <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{sp.message}</p>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            name="password"
            type="password"
            required
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

      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-500">
          No account yet?{' '}
          <Link href={`/uni/${slug}/register`} className="text-blue-600 hover:underline">
            Get started
          </Link>
        </p>
        <Link href={`/uni/${slug}/forgot-password`} className="text-sm text-blue-600 hover:underline">
          Forgot password?
        </Link>
      </div>
    </div>
  )
}
