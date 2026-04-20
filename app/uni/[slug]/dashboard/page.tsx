import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import WelcomeBanner from '@/app/uni/[slug]/components/WelcomeBanner'
import AddToHomeScreen from '@/app/uni/[slug]/components/AddToHomeScreen'
import DisclaimerModal from '@/app/uni/[slug]/components/DisclaimerModal'
import CheckboxButton from '@/app/uni/[slug]/components/CheckboxButton'

type Task = {
  id: string
  title: string
  description: string | null
  due_date: string | null
  category: string | null
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  'Getting Started':      { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  'IT Setup':             { bg: 'bg-violet-100',  text: 'text-violet-700', dot: 'bg-violet-500' },
  'Accommodation':        { bg: 'bg-orange-100',  text: 'text-orange-700', dot: 'bg-orange-500' },
  'Visa & Immigration':   { bg: 'bg-red-100',     text: 'text-red-700',    dot: 'bg-red-500' },
  'Student Life':         { bg: 'bg-green-100',   text: 'text-green-700',  dot: 'bg-green-500' },
  'Settling In':          { bg: 'bg-teal-100',    text: 'text-teal-700',   dot: 'bg-teal-500' },
  'Academic Preparation': { bg: 'bg-indigo-100',  text: 'text-indigo-700', dot: 'bg-indigo-500' },
  'Documents':            { bg: 'bg-amber-100',   text: 'text-amber-700',  dot: 'bg-amber-500' },
}

function categoryStyle(cat: string | null) {
  return CATEGORY_STYLES[cat ?? ''] ?? { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' }
}

function getDaysLeft(dueDate: string | null): number | null {
  if (!dueDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  return Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function daysLeftLabel(days: number | null): string {
  if (days === null) return ''
  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return 'Due today'
  if (days === 1) return '1 day left'
  return `${days} days left`
}

function daysLeftStyle(days: number | null): string {
  if (days === null) return 'text-gray-400 bg-gray-100'
  if (days < 0) return 'text-red-600 bg-red-50 font-semibold'
  if (days <= 7) return 'text-orange-600 bg-orange-50 font-semibold'
  if (days <= 30) return 'text-blue-600 bg-blue-50'
  return 'text-gray-500 bg-gray-100'
}

const GROUP_META: Record<string, { label: string; color: string }> = {
  overdue: { label: 'Overdue',      color: 'text-red-500' },
  week:    { label: 'Next 7 days',  color: 'text-orange-500' },
  month:   { label: 'Next 30 days', color: 'text-blue-500' },
  later:   { label: 'Later',        color: 'text-gray-400' },
  none:    { label: 'No deadline',  color: 'text-gray-400' },
}

function groupTasks(tasks: Task[]): { key: string; tasks: Task[] }[] {
  const groups: Record<string, Task[]> = { overdue: [], week: [], month: [], later: [], none: [] }
  for (const task of tasks) {
    const days = getDaysLeft(task.due_date)
    if (days === null) groups.none.push(task)
    else if (days < 0) groups.overdue.push(task)
    else if (days <= 7) groups.week.push(task)
    else if (days <= 30) groups.month.push(task)
    else groups.later.push(task)
  }
  return Object.entries(groups)
    .filter(([, t]) => t.length > 0)
    .map(([key, tasks]) => ({ key, tasks }))
}

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ welcome?: string }>
}) {
  const { slug } = await params
  const sp = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/uni/${slug}/login`)

  const { data: profile } = await supabase
    .from('users')
    .select('nationality, university_id, disclaimer_acknowledged, intake')
    .eq('id', user.id)
    .single()

  if (!profile) redirect(`/uni/${slug}/login`)

  // Nationality is required for correct task filtering — send them to settings if missing
  if (!profile.nationality) redirect(`/uni/${slug}/settings?error=Please+set+your+nationality+to+see+your+checklist`)

  const { data: university } = await supabase
    .from('universities')
    .select('home_country, name')
    .eq('id', profile.university_id!)
    .single()

  const isDomestic = !!profile.nationality && profile.nationality === university?.home_country
  const filterParts = ['nationality.is.null']
  if (isDomestic) {
    filterParts.push('nationality.eq.Domestic')
    filterParts.push(`nationality.eq.${profile.nationality}`)
  } else {
    filterParts.push('nationality.eq.International')
    if (profile.nationality) filterParts.push(`nationality.eq.${profile.nationality}`)
  }
  const filterCondition = filterParts.join(',')

  // Intake filter: show tasks with no intake (applies to all) OR matching the student's intake
  const intakeCondition = profile.intake
    ? `intake.is.null,intake.eq.${profile.intake}`
    : 'intake.is.null'

  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select(`id, title, description, due_date, category, task_filters!inner ( nationality )`)
    .eq('university_id', profile.university_id!)
    .or(filterCondition, { referencedTable: 'task_filters' })
    .or(intakeCondition)
    .order('due_date', { ascending: true, nullsFirst: false })

  if (tasksError) console.error('TASKS ERROR:', tasksError.message, { filterCondition, university_id: profile.university_id, nationality: profile.nationality })

  // Count all tasks for university (ignoring nationality filter) to distinguish empty states
  const { count: totalUniversityTasks } = await supabase
    .from('tasks')
    .select('id', { count: 'exact', head: true })
    .eq('university_id', profile.university_id!)

  const { data: completions } = await supabase
    .from('task_completions')
    .select('task_id')
    .eq('user_id', user.id)

  async function toggleTask(formData: FormData) {
    'use server'
    const task_id = formData.get('task_id') as string
    const isCompleted = formData.get('completed') === '1'
    const supabase = await createClient()
    const { data: { user: u } } = await supabase.auth.getUser()
    if (!u) return
    if (isCompleted) {
      await supabase.from('task_completions').delete().eq('task_id', task_id).eq('user_id', u.id)
    } else {
      await supabase.from('task_completions').insert({ task_id, user_id: u.id })
    }
    revalidatePath(`/uni/${slug}/dashboard`)
  }

  const completedIds = new Set(completions?.map((c) => c.task_id) ?? [])
  const uniqueTasks: Task[] = Array.from(new Map(tasks?.map((t) => [t.id, t]) ?? []).values())
  const total = uniqueTasks.length
  const done = uniqueTasks.filter((t) => completedIds.has(t.id)).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const groups = groupTasks(uniqueTasks)

  return (
    <div>
      {!profile.disclaimer_acknowledged && university?.name && (
        <DisclaimerModal universityName={university.name} slug={slug} />
      )}
      {sp.welcome === '1' && <WelcomeBanner name={profile.nationality ?? ''} />}
      <AddToHomeScreen />
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your checklist</h2>
          {profile.nationality && (
            <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${categoryStyle(null).bg} ${categoryStyle(null).text}`}>
              {profile.nationality}
            </span>
          )}
        </div>
        <a href={`/uni/${slug}/settings`} className="text-sm text-gray-400 hover:text-gray-600 mt-1">
          Settings
        </a>
      </div>

      {/* Progress card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-gray-700">Your progress</p>
            <p className="text-xs text-gray-400 mt-0.5">{done} of {total} tasks completed</p>
          </div>
          <span className="text-2xl font-bold text-blue-600">{pct}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
            }}
          />
        </div>
      </div>

      {/* Task groups */}
      {uniqueTasks.length === 0 ? (
        <div className="text-center text-gray-400 py-16 bg-white rounded-2xl border border-gray-100 px-6">
          {(totalUniversityTasks ?? 0) > 0 ? (
            <>
              <p className="text-2xl mb-3">🌍</p>
              <p className="text-base font-medium text-gray-600">No tasks for your nationality yet</p>
              <p className="text-sm mt-2">
                Your university hasn't added any tasks for <span className="font-medium text-gray-700">{profile.nationality}</span> students yet. Check back soon or contact your university if you think this is a mistake.
              </p>
            </>
          ) : (
            <>
              <p className="text-2xl mb-3">📋</p>
              <p className="text-base font-medium text-gray-600">No tasks yet</p>
              <p className="text-sm mt-2">Your university hasn't added any tasks yet. Check back soon.</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-7">
          {groups.map((group) => {
            const meta = GROUP_META[group.key]
            return (
              <div key={group.key}>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className={`text-xs font-bold uppercase tracking-widest ${meta.color}`}>
                    {meta.label}
                  </span>
                  <span className="text-xs text-gray-300">({group.tasks.length})</span>
                </div>
                <ul className="space-y-2">
                  {group.tasks.map((task) => {
                    const completed = completedIds.has(task.id)
                    const days = getDaysLeft(task.due_date)
                    const cat = categoryStyle(task.category)
                    return (
                      <li
                        key={task.id}
                        className={`
                          flex items-center gap-3 bg-white rounded-xl border px-4 py-3.5
                          hover:shadow-md hover:border-gray-300 transition-all
                          ${completed ? 'border-gray-100 opacity-50' : 'border-gray-200'}
                        `}
                      >
                        {/* Checkbox — toggles completion, does NOT navigate */}
                        <form action={toggleTask}>
                          <input type="hidden" name="task_id" value={task.id} />
                          <input type="hidden" name="completed" value={completed ? '1' : '0'} />
                          <CheckboxButton completed={completed} />
                        </form>

                        {/* Rest of card — navigates to task detail */}
                        <Link
                          href={`/uni/${slug}/tasks/${task.id}`}
                          className="flex flex-1 items-center gap-3 min-w-0"
                        >
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                              {task.title}
                            </p>
                            {task.category && (
                              <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${cat.bg} ${cat.text}`}>
                                {task.category}
                              </span>
                            )}
                          </div>

                          {task.due_date && (
                            <span className={`text-xs shrink-0 px-2 py-1 rounded-lg ${daysLeftStyle(days)}`}>
                              {daysLeftLabel(days)}
                            </span>
                          )}

                          <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
