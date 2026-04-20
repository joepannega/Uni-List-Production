import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { isEligible } from '@/lib/eligibility'
import { getEffectiveUniversityId } from '@/lib/effective-university'
import CopyButton from '@/app/admin/components/CopyButton'
import DeleteButton from '@/app/admin/components/DeleteButton'

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const CATEGORY_COLOURS: Record<string, string> = {
  'Getting Started':      'text-blue-600 bg-blue-50',
  'IT Setup':             'text-violet-600 bg-violet-50',
  'Accommodation':        'text-orange-600 bg-orange-50',
  'Visa & Immigration':   'text-red-600 bg-red-50',
  'Student Life':         'text-green-600 bg-green-50',
  'Settling In':          'text-teal-600 bg-teal-50',
  'Academic Preparation': 'text-indigo-600 bg-indigo-50',
  'Documents':            'text-amber-600 bg-amber-50',
}

export default async function AdminTasksPage() {
  const universityId = await getEffectiveUniversityId()

  const admin = createAdminClient()

  const { data: university } = await admin
    .from('universities')
    .select('slug, name, home_country')
    .eq('id', universityId)
    .single()

  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const protocol = host.startsWith('localhost') ? 'http' : 'https'
  const registerUrl = `${protocol}://${host}/uni/${university?.slug}/register`

  // Fetch tasks with filters and the user_id of each completion
  const { data: tasks } = await admin
    .from('tasks')
    .select(`
      id, title, due_date, category,
      task_filters ( nationality ),
      task_completions ( user_id )
    `)
    .eq('university_id', universityId)
    .order('due_date', { ascending: true, nullsFirst: false })

  // Fetch all students so we can compute eligible counts per task
  const { data: students } = await admin
    .from('users')
    .select('id, nationality')
    .eq('university_id', universityId)
    .eq('role', 'student')

  const homeCountry = university?.home_country ?? null
  const allStudents = students ?? []

  // Derive sorted unique categories for the rename panel
  const allCategories = [
    ...new Set((tasks ?? []).map((t) => t.category).filter(Boolean) as string[]),
  ].sort()

  async function deleteTask(formData: FormData) {
    'use server'
    const taskId = formData.get('task_id') as string
    const admin = createAdminClient()
    await admin.from('tasks').delete().eq('id', taskId)
    redirect('/admin/tasks')
  }

  async function renameCategory(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('users').select('university_id').eq('id', user.id).single()
    if (!profile?.university_id) return

    const oldName = formData.get('old_name') as string
    const newName = (formData.get('new_name') as string).trim()
    if (!newName || newName === oldName) {
      redirect('/admin/tasks')
    }

    const admin = createAdminClient()
    await admin
      .from('tasks')
      .update({ category: newName })
      .eq('university_id', profile.university_id)
      .eq('category', oldName)

    redirect('/admin/tasks')
  }

  return (
    <div>
      {/* Student sign-up link banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3.5 mb-6 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-blue-700 mb-0.5">Student sign-up link</p>
          <p className="text-xs text-blue-900 font-mono truncate">{registerUrl}</p>
        </div>
        <CopyButton text={registerUrl} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Tasks <span className="text-gray-400 font-normal text-base ml-1">({tasks?.length ?? 0})</span>
        </h2>
        <Link
          href="/admin/tasks/new"
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors shrink-0"
        >
          + New task
        </Link>
      </div>

      {!tasks || tasks.length === 0 ? (
        <div className="text-center text-gray-400 py-16 bg-white rounded-xl border border-gray-200">
          <p>No tasks yet.</p>
          <Link href="/admin/tasks/new" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
            Create your first task
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const filters = task.task_filters ?? []

            // Count only eligible students for this task
            const eligibleStudents = allStudents.filter((s) =>
              isEligible(s, filters, homeCountry)
            )
            const eligibleIds = new Set(eligibleStudents.map((s) => s.id))

            // Count completions only from eligible students
            const completionCount = (task.task_completions ?? []).filter((c) =>
              eligibleIds.has(c.user_id)
            ).length

            const eligibleCount = eligibleStudents.length

            const filterLabel =
              filters.length === 0
                ? 'All students'
                : filters.map((f) => f.nationality ?? 'All').join(', ')

            const catStyle = CATEGORY_COLOURS[task.category ?? ''] ?? 'text-gray-500 bg-gray-100'
            const due = formatDate(task.due_date)

            // Completion rate as a percentage for colour coding
            const pct = eligibleCount > 0 ? Math.round((completionCount / eligibleCount) * 100) : null
            const pctColour =
              pct === null ? 'text-gray-400' :
              pct === 100  ? 'text-green-600' :
              pct >= 50    ? 'text-blue-600'  :
                             'text-orange-500'

            return (
              <div key={task.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3.5">
                {/* Title row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <Link
                    href={`/admin/tasks/${task.id}`}
                    className="text-sm font-semibold text-gray-900 hover:text-blue-600 leading-snug flex-1"
                  >
                    {task.title}
                  </Link>
                  <div className="flex items-center gap-3 shrink-0 mt-0.5">
                    <Link href={`/admin/tasks/${task.id}/edit`} className="text-xs text-blue-600 hover:underline">
                      Edit
                    </Link>
                    <form id={`delete-${task.id}`} action={deleteTask}>
                      <input type="hidden" name="task_id" value={task.id} />
                    </form>
                    <DeleteButton formId={`delete-${task.id}`} />
                  </div>
                </div>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-2">
                  {task.category && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${catStyle}`}>
                      {task.category}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">{filterLabel}</span>
                  {due && <span className="text-xs text-gray-400">· {due}</span>}

                  {/* Accurate completion count — eligible students only */}
                  <Link
                    href={`/admin/tasks/${task.id}`}
                    className={`text-xs font-medium ml-auto hover:underline ${pctColour}`}
                  >
                    {eligibleCount === 0
                      ? 'No eligible students'
                      : `${completionCount} / ${eligibleCount} completed`}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Category management — rename across all tasks */}
      {allCategories.length > 0 && (
        <div className="mt-10">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Manage categories</h3>
          <p className="text-xs text-gray-400 mb-4">
            Renaming a category updates every task that uses it instantly.
          </p>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {allCategories.map((cat) => {
              const count = (tasks ?? []).filter((t) => t.category === cat).length
              return (
                <form key={cat} action={renameCategory} className="flex items-center gap-3 px-4 py-3">
                  <input type="hidden" name="old_name" value={cat} />
                  <input
                    name="new_name"
                    type="text"
                    defaultValue={cat}
                    className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-400 shrink-0 w-16 text-right">
                    {count} task{count !== 1 ? 's' : ''}
                  </span>
                  <button
                    type="submit"
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium shrink-0 px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Rename
                  </button>
                </form>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
