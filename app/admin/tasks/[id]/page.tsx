import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { isEligible } from '@/lib/eligibility'
import { getEffectiveUniversityId } from '@/lib/effective-university'

export default async function AdminTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const universityId = await getEffectiveUniversityId()

  const admin = createAdminClient()

  const { data: task } = await admin
    .from('tasks')
    .select('id, title, description, category, due_date, task_filters ( nationality )')
    .eq('id', id)
    .eq('university_id', universityId)
    .single()

  if (!task) notFound()

  // Need home_country to resolve Domestic / International filters
  const { data: university } = await admin
    .from('universities')
    .select('home_country')
    .eq('id', universityId)
    .single()

  const homeCountry = university?.home_country ?? null
  const filters = task.task_filters ?? []

  // All students at this university
  const { data: allStudents } = await admin
    .from('users')
    .select('id, email, nationality')
    .eq('university_id', universityId)
    .eq('role', 'student')
    .order('email')

  // Filter to only the students this task actually applies to
  const students = (allStudents ?? []).filter((s) => isEligible(s, filters, homeCountry))

  // Who completed this task
  const { data: completions } = await admin
    .from('task_completions')
    .select('user_id, completed_at')
    .eq('task_id', id)

  const completedMap = new Map(completions?.map((c) => [c.user_id, c.completed_at]) ?? [])

  // Split eligible students only
  const completed = students.filter((s) => completedMap.has(s.id))
  const pending   = students.filter((s) => !completedMap.has(s.id))

  const pct = students.length > 0
    ? Math.round((completed.length / students.length) * 100)
    : null

  const filterLabel =
    filters.length === 0
      ? 'All students'
      : filters.map((f: { nationality: string | null }) => f.nationality ?? 'All').join(', ')

  const dueLabel = task.due_date
    ? new Date(task.due_date).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/tasks" className="text-sm text-gray-500 hover:text-gray-700">← Tasks</Link>
      </div>

      {/* Task info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900">{task.title}</h2>
            {task.description && (
              <p className="text-sm text-gray-500 mt-1">{task.description}</p>
            )}
          </div>
          <Link
            href={`/admin/tasks/${id}/edit`}
            className="shrink-0 text-sm text-blue-600 hover:underline"
          >
            Edit
          </Link>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          {task.category && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
              {task.category}
            </span>
          )}
          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
            {filterLabel}
          </span>
          {dueLabel && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
              Due {dueLabel}
            </span>
          )}
        </div>
      </div>

      {students.length === 0 ? (
        <div className="text-center text-gray-400 py-12 bg-white rounded-xl border border-gray-200">
          <p>No eligible students registered yet.</p>
        </div>
      ) : (
        <>
          {/* Stats — shown as fraction + progress bar so context is always clear */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-gray-700">Completion</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {completed.length} of {students.length} eligible students
                </p>
              </div>
              <span className={`text-2xl font-bold ${pct === 100 ? 'text-green-500' : 'text-blue-600'}`}>
                {pct}%
              </span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct ?? 0}%`,
                  background: pct === 100
                    ? '#22c55e'
                    : 'linear-gradient(90deg, #3b82f6, #6366f1)',
                }}
              />
            </div>
          </div>

          {/* Completed */}
          {completed.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-green-600 mb-3 px-1">
                Completed ({completed.length})
              </p>
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
                {completed.map((s) => (
                  <Link
                    key={s.id}
                    href={`/admin/students/${s.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <span className="shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{s.email}</p>
                      {s.nationality && (
                        <p className="text-xs text-gray-400">{s.nationality}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">
                      {new Date(completedMap.get(s.id)!).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short',
                      })}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Pending */}
          {pending.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 px-1">
                Not yet done ({pending.length})
              </p>
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
                {pending.map((s) => (
                  <Link
                    key={s.id}
                    href={`/admin/students/${s.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <span className="shrink-0 w-5 h-5 rounded-full border-2 border-gray-200" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{s.email}</p>
                      {s.nationality && (
                        <p className="text-xs text-gray-400">{s.nationality}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
