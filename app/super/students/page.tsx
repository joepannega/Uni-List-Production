import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'

export default async function SuperStudentSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''

  const admin = createAdminClient()

  let results: {
    id: string
    email: string
    nationality: string | null
    intake: string | null
    created_at: string
    university_id: string
    universityName: string
    universitySlug: string
    tasksTotal: number
    tasksDone: number
    lastSignIn: string | null
  }[] = []

  if (query.length >= 2) {
    // Search students by email (case-insensitive partial match)
    const { data: students } = await admin
      .from('users')
      .select('id, email, nationality, intake, created_at, university_id')
      .eq('role', 'student')
      .ilike('email', `%${query}%`)
      .order('email')
      .limit(50)

    if (students && students.length > 0) {
      // Fetch universities for the matched students
      const uniIds = [...new Set(students.map((s) => s.university_id))]
      const { data: universities } = await admin
        .from('universities')
        .select('id, name, slug')
        .in('id', uniIds)

      const uniMap = new Map((universities ?? []).map((u) => [u.id, u]))

      // Fetch task counts and completion counts per student
      const studentIds = students.map((s) => s.id)

      // All tasks for the relevant universities
      const { data: tasks } = await admin
        .from('tasks')
        .select('id, university_id')
        .in('university_id', uniIds)

      const tasksByUni = new Map<string, string[]>()
      for (const t of tasks ?? []) {
        if (!tasksByUni.has(t.university_id)) tasksByUni.set(t.university_id, [])
        tasksByUni.get(t.university_id)!.push(t.id)
      }

      // All completions for matched students
      const { data: completions } = await admin
        .from('task_completions')
        .select('user_id, task_id')
        .in('user_id', studentIds)

      const completionsByStudent = new Map<string, Set<string>>()
      for (const c of completions ?? []) {
        if (!completionsByStudent.has(c.user_id)) completionsByStudent.set(c.user_id, new Set())
        completionsByStudent.get(c.user_id)!.add(c.task_id)
      }

      // Fetch last_sign_in_at from Auth
      const lastSignInMap = new Map<string, string | null>()
      const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 })
      const studentIdSet = new Set(studentIds)
      for (const authUser of authData?.users ?? []) {
        if (studentIdSet.has(authUser.id)) {
          lastSignInMap.set(authUser.id, authUser.last_sign_in_at ?? null)
        }
      }

      results = students.map((s) => {
        const uni = uniMap.get(s.university_id)
        const uniTasks = tasksByUni.get(s.university_id) ?? []
        const done = completionsByStudent.get(s.id)?.size ?? 0
        return {
          ...s,
          universityName: uni?.name ?? 'Unknown',
          universitySlug: uni?.slug ?? '',
          tasksTotal: uniTasks.length,
          tasksDone: done,
          lastSignIn: lastSignInMap.get(s.id) ?? null,
        }
      })
    }
  }

  function lastActiveLabel(lastSignIn: string | null, createdAt: string): { label: string; colour: string } {
    if (!lastSignIn) return { label: 'Never logged in', colour: 'text-gray-400' }
    const signInMs  = new Date(lastSignIn).getTime()
    const createdMs = new Date(createdAt).getTime()
    const nowMs     = Date.now()
    const neverReturned = signInMs - createdMs < 5 * 60 * 1000
    const daysAgo = Math.floor((nowMs - signInMs) / (1000 * 60 * 60 * 24))
    if (neverReturned && daysAgo > 0) return { label: 'Never returned', colour: 'text-red-500' }
    if (daysAgo === 0) return { label: 'Active today',     colour: 'text-green-600' }
    if (daysAgo === 1) return { label: 'Active yesterday', colour: 'text-green-500' }
    if (daysAgo <= 7)  return { label: `Active ${daysAgo}d ago`, colour: 'text-blue-500' }
    if (daysAgo <= 30) return { label: `Active ${daysAgo}d ago`, colour: 'text-amber-500' }
    return { label: `Last active ${new Date(lastSignIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`, colour: 'text-red-500' }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Student search</h2>
        <p className="text-sm text-gray-400 mt-0.5">Find any student across all universities by email address.</p>
      </div>

      {/* Search form */}
      <form method="GET" className="mb-6">
        <div className="flex gap-2">
          <input
            name="q"
            type="text"
            defaultValue={query}
            placeholder="Search by email address…"
            autoFocus
            autoComplete="off"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shrink-0"
          >
            Search
          </button>
        </div>
        {query.length === 1 && (
          <p className="text-xs text-gray-400 mt-2">Enter at least 2 characters to search.</p>
        )}
      </form>

      {/* Results */}
      {query.length >= 2 && (
        <>
          <p className="text-xs text-gray-400 mb-3">
            {results.length === 0
              ? `No students found matching "${query}"`
              : `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`}
          </p>

          {results.length > 0 && (
            <div className="space-y-2">
              {results.map((s) => {
                const pct = s.tasksTotal > 0 ? Math.round((s.tasksDone / s.tasksTotal) * 100) : 0
                const { label: activeLabel, colour: activeColour } = lastActiveLabel(s.lastSignIn, s.created_at)
                const joined = new Date(s.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })

                return (
                  <div key={s.id} className="bg-white rounded-xl border border-gray-200 px-4 py-4">
                    {/* University badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{s.email}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {s.nationality ?? 'No nationality'}
                          {s.intake ? ` · ${s.intake}` : ''}
                          {' · '}Joined {joined}
                        </p>
                        <p className={`text-xs font-medium mt-0.5 ${activeColour}`}>{activeLabel}</p>
                      </div>
                      <span className="shrink-0 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                        {s.universityName}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: pct === 100 ? '#22c55e' : 'linear-gradient(90deg, #3b82f6, #6366f1)',
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">{s.tasksDone}/{s.tasksTotal} tasks</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <a
                        href={`/super/universities/${s.university_id}/view`}
                        className="text-xs bg-violet-100 hover:bg-violet-200 text-violet-700 font-medium px-3 py-1.5 rounded-lg transition-colors"
                      >
                        View as admin
                      </a>
                      <span className="text-xs text-gray-300">then</span>
                      <Link
                        href={`/admin/students/${s.id}`}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Open student profile →
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {!query && (
        <div className="text-center text-gray-400 py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-2xl mb-3">🔍</p>
          <p className="text-sm">Search by email to find a student across any university.</p>
        </div>
      )}
    </div>
  )
}
