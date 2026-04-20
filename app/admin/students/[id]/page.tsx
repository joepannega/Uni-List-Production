import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { getEffectiveUniversityId } from '@/lib/effective-university'

function lastActiveInfo(lastSignIn: string | null, createdAt: string): {
  label: string
  detail: string
  colour: string
} {
  if (!lastSignIn) return { label: 'Never logged in', detail: '', colour: 'text-gray-400' }

  const signInMs  = new Date(lastSignIn).getTime()
  const createdMs = new Date(createdAt).getTime()
  const nowMs     = Date.now()
  const neverReturned = signInMs - createdMs < 5 * 60 * 1000
  const daysAgo = Math.floor((nowMs - signInMs) / (1000 * 60 * 60 * 24))
  const formatted = new Date(lastSignIn).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  if (neverReturned && daysAgo > 0) {
    return { label: 'Never returned', detail: `Registered ${formatted} and has not logged in since`, colour: 'text-red-500' }
  }
  if (daysAgo === 0) return { label: 'Active today',     detail: `Last login: ${formatted}`, colour: 'text-green-600' }
  if (daysAgo === 1) return { label: 'Active yesterday', detail: `Last login: ${formatted}`, colour: 'text-green-500' }
  if (daysAgo <= 7)  return { label: `Active ${daysAgo} days ago`, detail: `Last login: ${formatted}`, colour: 'text-blue-500' }
  if (daysAgo <= 30) return { label: `Active ${daysAgo} days ago`, detail: `Last login: ${formatted}`, colour: 'text-amber-500' }
  return { label: 'Inactive', detail: `Last login: ${formatted}`, colour: 'text-red-500' }
}

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const universityId = await getEffectiveUniversityId()

  const admin = createAdminClient()

  // Fetch the student — must belong to the same university
  const { data: student } = await admin
    .from('users')
    .select('id, email, nationality, intake, created_at, university_id')
    .eq('id', id)
    .eq('university_id', universityId)
    .eq('role', 'student')
    .single()

  if (!student) notFound()

  // Fetch last_sign_in_at from Supabase Auth
  const { data: authUserData } = await admin.auth.admin.getUserById(id)
  const lastSignIn = authUserData?.user?.last_sign_in_at ?? null

  // Fetch tasks for this university
  const { data: tasks } = await admin
    .from('tasks')
    .select('id, title, category, due_date')
    .eq('university_id', universityId)
    .order('due_date', { ascending: true, nullsFirst: false })

  // Fetch this student's completions
  const { data: completions } = await admin
    .from('task_completions')
    .select('task_id, completed_at')
    .eq('user_id', id)

  const completedMap = new Map(completions?.map((c) => [c.task_id, c.completed_at]) ?? [])

  const totalTasks = tasks?.length ?? 0
  const doneTasks = tasks?.filter((t) => completedMap.has(t.id)).length ?? 0
  const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
  const joined = new Date(student.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  const { label: activeLabel, detail: activeDetail, colour: activeColour } = lastActiveInfo(
    lastSignIn,
    student.created_at,
  )

  // Group tasks by category
  const grouped: Record<string, typeof tasks> = {}
  for (const task of tasks ?? []) {
    const cat = task.category ?? 'Other'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat]!.push(task)
  }

  const CATEGORY_COLOURS: Record<string, string> = {
    'Getting Started':      'text-blue-600',
    'IT Setup':             'text-violet-600',
    'Accommodation':        'text-orange-600',
    'Visa & Immigration':   'text-red-600',
    'Student Life':         'text-green-600',
    'Settling In':          'text-teal-600',
    'Academic Preparation': 'text-indigo-600',
    'Documents':            'text-amber-600',
  }

  return (
    <div className="max-w-2xl">
      {/* Back */}
      <Link href="/admin/students" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block">
        ← Students
      </Link>

      {/* Student card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600 shrink-0">
            {student.email[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{student.email}</p>
            <p className="text-sm text-gray-400 mt-0.5">
              {student.nationality ?? 'No nationality'}
              {student.intake ? ` · ${student.intake}` : ''}
              {' · '}Joined {joined}
            </p>
            {/* Last active */}
            <div className="mt-2 flex items-center gap-1.5">
              <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                activeColour === 'text-green-600' || activeColour === 'text-green-500'
                  ? 'bg-green-500'
                  : activeColour === 'text-blue-500'
                  ? 'bg-blue-400'
                  : activeColour === 'text-amber-500'
                  ? 'bg-amber-400'
                  : 'bg-red-400'
              }`} />
              <span className={`text-xs font-medium ${activeColour}`}>{activeLabel}</span>
              {activeDetail && (
                <span className="text-xs text-gray-400">— {activeDetail}</span>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-blue-600">{pct}%</p>
            <p className="text-xs text-gray-400">{doneTasks} of {totalTasks} done</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              background: pct === 100 ? '#22c55e' : 'linear-gradient(90deg, #3b82f6, #6366f1)',
            }}
          />
        </div>
      </div>

      {/* Task breakdown by category */}
      <div className="space-y-5">
        {Object.entries(grouped).map(([category, catTasks]) => {
          const catDone = catTasks!.filter((t) => completedMap.has(t.id)).length
          const colour = CATEGORY_COLOURS[category] ?? 'text-gray-500'

          return (
            <div key={category} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className={`text-xs font-bold uppercase tracking-wide ${colour}`}>{category}</span>
                <span className="text-xs text-gray-400">{catDone}/{catTasks!.length}</span>
              </div>
              <ul className="divide-y divide-gray-50">
                {catTasks!.map((task) => {
                  const done = completedMap.has(task.id)
                  const completedAt = completedMap.get(task.id)
                  return (
                    <li key={task.id} className="flex items-center gap-3 px-4 py-3">
                      {/* Status dot */}
                      <span className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
                        ${done ? 'bg-green-500 border-green-500' : 'border-gray-200'}`}>
                        {done && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {task.title}
                        </p>
                        {done && completedAt && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            Completed {new Date(completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </p>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
