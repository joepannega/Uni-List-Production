import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <>{children}</>

  const { data: profile } = await supabase
    .from('users')
    .select('role, university_id')
    .eq('id', user.id)
    .single()

  // Not logged in or no valid profile — render children as-is (login page handles itself)
  if (!user || !profile || !['admin', 'super_admin'].includes(profile.role)) {
    return <>{children}</>
  }

  // Super admins can view any university via the super_viewing_as cookie
  const cookieStore = await cookies()
  const viewingAs = profile.role === 'super_admin'
    ? cookieStore.get('super_viewing_as')?.value ?? null
    : null

  // Resolve the university being viewed (for the banner name)
  let viewingUniversityName: string | null = null
  if (viewingAs) {
    const admin = createAdminClient()
    const { data: uni } = await admin
      .from('universities')
      .select('name')
      .eq('id', viewingAs)
      .single()
    viewingUniversityName = uni?.name ?? null
  }

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* View-as banner — shown only when super admin is browsing as a university */}
      {viewingAs && (
        <div className="bg-violet-600 text-white text-sm px-4 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>
              Viewing as <strong>{viewingUniversityName ?? 'university'}</strong> — changes you make here are real
            </span>
          </div>
          <a
            href="/super/exit-view"
            className="shrink-0 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            ← Exit to Super Admin
          </a>
        </div>
      )}

      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <span className="font-semibold text-gray-900 text-sm shrink-0">Uni-List Admin</span>
          <nav className="flex items-center gap-1">
            <Link
              href="/admin/tasks"
              className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              Tasks
            </Link>
            <Link
              href="/admin/students"
              className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              Students
            </Link>
          </nav>
          <form action={signOut}>
            <button type="submit" className="text-sm text-gray-500 hover:text-gray-700 shrink-0">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
