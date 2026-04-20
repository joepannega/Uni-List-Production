import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'

function adminLastLoginLabel(lastSignIn: string | null): { label: string; colour: string } {
  if (!lastSignIn) return { label: 'Never logged in', colour: 'text-red-500' }
  const daysAgo = Math.floor((Date.now() - new Date(lastSignIn).getTime()) / (1000 * 60 * 60 * 24))
  if (daysAgo === 0) return { label: 'Today',           colour: 'text-green-600' }
  if (daysAgo === 1) return { label: 'Yesterday',       colour: 'text-green-500' }
  if (daysAgo <= 7)  return { label: `${daysAgo}d ago`, colour: 'text-blue-500' }
  if (daysAgo <= 30) return { label: `${daysAgo}d ago`, colour: 'text-amber-500' }
  return {
    label: new Date(lastSignIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    colour: 'text-red-500',
  }
}

export default async function SuperDashboardPage() {
  const admin = createAdminClient()

  const { data: universities } = await admin
    .from('universities')
    .select('id, name, slug, home_country, created_at')
    .order('name')

  if (!universities || universities.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Universities</h2>
          <Link href="/super/universities/new" className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors">
            + Add university
          </Link>
        </div>
        <div className="text-center text-gray-400 py-16 bg-white rounded-xl border border-gray-200">
          <p>No universities yet.</p>
          <Link href="/super/universities/new" className="text-sm text-blue-600 hover:underline mt-2 inline-block">Add the first university</Link>
        </div>
      </div>
    )
  }

  const uniIds = universities.map((u) => u.id)

  // Single queries across all universities — no N+1
  const [{ data: allUsers }, { data: taskRows }, { count: totalCompletions }] = await Promise.all([
    admin
      .from('users')
      .select('id, university_id, role')
      .in('university_id', uniIds)
      .in('role', ['admin', 'super_admin', 'student']),
    admin
      .from('tasks')
      .select('university_id')
      .in('university_id', uniIds),
    admin
      .from('task_completions')
      .select('*', { count: 'exact', head: true }),
  ])

  // Fetch last_sign_in_at for all users from Supabase Auth (one call, reused below)
  const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const authUsers = authData?.users ?? []

  // Build sign-in map for admin last-login display
  const adminUserIds = (allUsers ?? [])
    .filter((u) => u.role === 'admin')
    .map((u) => u.id)

  const lastSignInByUser = new Map<string, string | null>()
  if (adminUserIds.length > 0) {
    const adminIdSet = new Set(adminUserIds)
    for (const authUser of authUsers) {
      if (adminIdSet.has(authUser.id)) {
        lastSignInByUser.set(authUser.id, authUser.last_sign_in_at ?? null)
      }
    }
  }

  // Platform-wide stats
  const studentUsers = (allUsers ?? []).filter((u) => u.role === 'student')
  const totalAccounts = studentUsers.length
  const studentIdSet = new Set(studentUsers.map((u) => u.id))
  const totalLogins = authUsers.filter(
    (u) => studentIdSet.has(u.id) && u.last_sign_in_at,
  ).length

  // Roll up per-university
  const studentCountByUni  = new Map<string, number>()
  const adminCountByUni    = new Map<string, number>()
  const lastLoginByUni     = new Map<string, string | null>()

  for (const u of allUsers ?? []) {
    if (u.role === 'student') {
      studentCountByUni.set(u.university_id, (studentCountByUni.get(u.university_id) ?? 0) + 1)
    }
    if (u.role === 'admin') {
      adminCountByUni.set(u.university_id, (adminCountByUni.get(u.university_id) ?? 0) + 1)
      const signIn = lastSignInByUser.get(u.id) ?? null
      const current = lastLoginByUni.get(u.university_id) ?? null
      if (!current || (signIn && signIn > current)) {
        lastLoginByUni.set(u.university_id, signIn)
      }
    }
  }

  const taskCountByUni = new Map<string, number>()
  for (const row of taskRows ?? []) {
    taskCountByUni.set(row.university_id, (taskCountByUni.get(row.university_id) ?? 0) + 1)
  }

  return (
    <div>
      {/* Platform-wide stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Accounts created</p>
          <p className="text-3xl font-bold text-gray-900">{totalAccounts.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">student accounts across all unis</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Students logged in</p>
          <p className="text-3xl font-bold text-gray-900">{totalLogins.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">
            {totalAccounts > 0
              ? `${Math.round((totalLogins / totalAccounts) * 100)}% of accounts`
              : 'no accounts yet'}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Tasks completed</p>
          <p className="text-3xl font-bold text-gray-900">{(totalCompletions ?? 0).toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">across all universities</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Universities</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {universities.length} universit{universities.length !== 1 ? 'ies' : 'y'} on the platform
          </p>
        </div>
        <Link
          href="/super/universities/new"
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors shrink-0"
        >
          + Add university
        </Link>
      </div>

      <div className="space-y-3">
        {universities.map((uni) => {
          const students  = studentCountByUni.get(uni.id) ?? 0
          const tasks     = taskCountByUni.get(uni.id) ?? 0
          const admins    = adminCountByUni.get(uni.id) ?? 0
          const lastLogin = lastLoginByUni.get(uni.id) ?? null
          const { label: loginLabel, colour: loginColour } = adminLastLoginLabel(lastLogin)

          const noAdmins      = admins === 0
          const noTasks       = tasks === 0
          const noHomeCountry = !uni.home_country
          const hasWarning    = noAdmins || noTasks || noHomeCountry

          return (
            <div
              key={uni.id}
              className={`bg-white rounded-xl border px-5 py-4 ${hasWarning ? 'border-amber-200' : 'border-gray-200'}`}
            >
              {/* Top row: name + warning badges + manage link */}
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900">{uni.name}</p>
                    {noAdmins && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">No admins</span>
                    )}
                    {noTasks && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">No tasks</span>
                    )}
                    {noHomeCountry && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">No home country</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    /uni/{uni.slug}
                    {uni.home_country ? ` · ${uni.home_country}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`/super/universities/${uni.id}/view`}
                    className="text-xs bg-violet-100 hover:bg-violet-200 text-violet-700 font-medium px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    View as admin
                  </a>
                  <Link
                    href={`/super/universities/${uni.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-0.5"
                  >
                    Manage →
                  </Link>
                </div>
              </div>

              {/* Stats row */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-5 flex-wrap text-sm">
                <span>
                  <strong className="text-gray-900">{students}</strong>{' '}
                  <span className="text-gray-400">student{students !== 1 ? 's' : ''}</span>
                </span>
                <span>
                  <strong className="text-gray-900">{tasks}</strong>{' '}
                  <span className="text-gray-400">task{tasks !== 1 ? 's' : ''}</span>
                </span>
                <span>
                  <strong className="text-gray-900">{admins}</strong>{' '}
                  <span className="text-gray-400">admin{admins !== 1 ? 's' : ''}</span>
                </span>

                {/* Admin last login — rightmost, most important for support */}
                <span className="ml-auto flex items-center gap-1.5">
                  <span className="text-xs text-gray-400">Admin last active:</span>
                  <span className={`text-xs font-semibold ${loginColour}`}>{loginLabel}</span>
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
