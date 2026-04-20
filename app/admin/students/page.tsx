import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { getEffectiveUniversityId } from '@/lib/effective-university'

function lastActiveLabel(lastSignIn: string | null, createdAt: string): {
  label: string
  colour: string
} {
  if (!lastSignIn) return { label: 'Never logged in', colour: 'text-gray-400' }

  const signInMs  = new Date(lastSignIn).getTime()
  const createdMs = new Date(createdAt).getTime()
  const nowMs     = Date.now()

  // If sign-in is within 5 minutes of registration, they haven't come back
  const neverReturned = signInMs - createdMs < 5 * 60 * 1000

  const daysAgo = Math.floor((nowMs - signInMs) / (1000 * 60 * 60 * 24))

  if (neverReturned && daysAgo > 0) {
    return { label: 'Never returned', colour: 'text-red-500' }
  }
  if (daysAgo === 0) return { label: 'Active today',      colour: 'text-green-600' }
  if (daysAgo === 1) return { label: 'Active yesterday',  colour: 'text-green-500' }
  if (daysAgo <= 7)  return { label: `Active ${daysAgo}d ago`, colour: 'text-blue-500' }
  if (daysAgo <= 30) return { label: `Active ${daysAgo}d ago`, colour: 'text-amber-500' }
  return {
    label: `Last active ${new Date(lastSignIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`,
    colour: 'text-red-500',
  }
}

export default async function AdminStudentsPage() {
  const universityId = await getEffectiveUniversityId()

  const admin = createAdminClient()

  const { data: students } = await admin
    .from('users')
    .select('id, email, nationality, intake, created_at')
    .eq('university_id', universityId)
    .eq('role', 'student')
    .order('created_at', { ascending: false })

  const { data: tasks } = await admin
    .from('tasks')
    .select('id')
    .eq('university_id', universityId)

  const studentIds = students?.map((s) => s.id) ?? []
  const taskIds    = tasks?.map((t) => t.id) ?? []
  const totalTasks = taskIds.length

  // Fetch last_sign_in_at for all students from Supabase Auth in one call
  const lastSignInMap = new Map<string, string | null>()
  if (studentIds.length > 0) {
    // listUsers returns up to 1000 per page — fine for MVP
    const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 })
    const studentIdSet = new Set(studentIds)
    for (const authUser of authData?.users ?? []) {
      if (studentIdSet.has(authUser.id)) {
        lastSignInMap.set(authUser.id, authUser.last_sign_in_at ?? null)
      }
    }
  }

  let completionCounts: Map<string, number> = new Map()
  if (studentIds.length > 0 && taskIds.length > 0) {
    const { data: completions } = await admin
      .from('task_completions')
      .select('user_id, task_id')
      .in('user_id', studentIds)
      .in('task_id', taskIds)

    for (const c of completions ?? []) {
      completionCounts.set(c.user_id, (completionCounts.get(c.user_id) ?? 0) + 1)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">Students</h2>
          <span className="text-sm text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full font-medium">
            {students?.length ?? 0}
          </span>
        </div>
        {students && students.length > 0 && (
          <a
            href="/admin/students/export"
            download
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </a>
        )}
      </div>

      {!students || students.length === 0 ? (
        <div className="text-center text-gray-400 py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-lg">No students registered yet.</p>
          <p className="text-sm mt-1">Share your university sign-up link to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {students.map((student) => {
            const done = completionCounts.get(student.id) ?? 0
            const pct  = totalTasks > 0 ? Math.round((done / totalTasks) * 100) : 0
            const joined = new Date(student.created_at).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric',
            })
            const { label: activeLabel, colour: activeColour } = lastActiveLabel(
              lastSignInMap.get(student.id) ?? null,
              student.created_at,
            )

            return (
              <Link
                key={student.id}
                href={`/admin/students/${student.id}`}
                className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3.5 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                {/* Avatar */}
                <div className="shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                  {student.email[0].toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{student.email}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <p className="text-xs text-gray-400 truncate">
                      {student.nationality ?? 'No nationality'}
                      {student.intake ? ` · ${student.intake}` : ''}
                      {' · '}Joined {joined}
                    </p>
                    <span className={`text-xs font-medium ${activeColour}`}>
                      · {activeLabel}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: pct === 100 ? '#22c55e' : 'linear-gradient(90deg, #3b82f6, #6366f1)',
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{done}/{totalTasks}</span>
                  </div>
                </div>

                <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
