import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import SignUpBanner from '@/app/uni/[slug]/components/SignUpBanner'
import ShareLinkButton from '@/app/uni/[slug]/components/ShareLinkButton'

const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  'Getting Started':      { bg: 'bg-blue-100',   text: 'text-blue-700' },
  'IT Setup':             { bg: 'bg-violet-100',  text: 'text-violet-700' },
  'Accommodation':        { bg: 'bg-orange-100',  text: 'text-orange-700' },
  'Visa & Immigration':   { bg: 'bg-red-100',     text: 'text-red-700' },
  'Student Life':         { bg: 'bg-green-100',   text: 'text-green-700' },
  'Settling In':          { bg: 'bg-teal-100',    text: 'text-teal-700' },
  'Academic Preparation': { bg: 'bg-indigo-100',  text: 'text-indigo-700' },
  'Documents':            { bg: 'bg-amber-100',   text: 'text-amber-700' },
}

function categoryStyle(cat: string | null) {
  return CATEGORY_STYLES[cat ?? ''] ?? { bg: 'bg-gray-100', text: 'text-gray-600' }
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function getDaysLeft(dueDate: string | null): number | null {
  if (!dueDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  return Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function daysLeftStyle(days: number | null): string {
  if (days === null) return 'text-gray-400 bg-gray-100'
  if (days < 0) return 'text-red-600 bg-red-50 font-semibold'
  if (days <= 7) return 'text-orange-600 bg-orange-50 font-semibold'
  if (days <= 30) return 'text-blue-600 bg-blue-50'
  return 'text-gray-500 bg-gray-100'
}

function daysLeftLabel(days: number | null, dateStr: string | null): string {
  if (days === null) return ''
  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return 'Due today'
  if (days === 1) return '1 day left'
  if (days <= 30) return `${days} days left`
  return formatDate(dateStr) ?? ''
}

export default async function UniLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // If already logged in as a student, send to dashboard
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role === 'student') {
      redirect(`/uni/${slug}/dashboard`)
    }
  }

  const admin = createAdminClient()

  const { data: university } = await admin
    .from('universities')
    .select('id, name')
    .eq('slug', slug)
    .single()

  if (!university) return null

  // Build the canonical URL for this page
  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const protocol = host.startsWith('localhost') ? 'http' : 'https'
  const pageUrl = `${protocol}://${host}/uni/${slug}`

  // Fetch all tasks for this university (public preview — no nationality filtering)
  const { data: tasks } = await admin
    .from('tasks')
    .select('id, title, description, due_date, category')
    .eq('university_id', university.id)
    .order('due_date', { ascending: true, nullsFirst: false })

  // Group by category for a cleaner preview
  const byCategory: Record<string, typeof tasks> = {}
  const uncategorised: typeof tasks = []

  for (const task of tasks ?? []) {
    if (task.category) {
      if (!byCategory[task.category]) byCategory[task.category] = []
      byCategory[task.category]!.push(task)
    } else {
      uncategorised.push(task)
    }
  }

  const categoryOrder = [
    'Getting Started',
    'IT Setup',
    'Accommodation',
    'Visa & Immigration',
    'Documents',
    'Academic Preparation',
    'Student Life',
    'Settling In',
  ]

  const orderedCategories = [
    ...categoryOrder.filter((c) => byCategory[c]?.length),
    ...Object.keys(byCategory).filter((c) => !categoryOrder.includes(c)),
  ]

  const totalTasks = (tasks?.length ?? 0) + uncategorised.length

  return (
    <div className="pb-28">
      {/* Hero */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Your arrival checklist
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Everything you need to do before and after arriving at {university.name} — in one place.
        </p>
      </div>

      {/* Sign-up CTA card */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-4 mb-6">
        <p className="text-sm font-semibold text-blue-900">
          Sign up to track your progress
        </p>
        <p className="text-xs text-blue-700 mt-0.5 mb-3">
          Create a free account to tick off tasks and get a personalised checklist based on your nationality.
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/uni/${slug}/register`}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            Get started — it's free
          </Link>
          <Link
            href={`/uni/${slug}/login`}
            className="text-sm text-blue-700 hover:underline px-2 py-2"
          >
            Sign in
          </Link>
        </div>
        <div className="mt-3 pt-3 border-t border-blue-200 flex items-center gap-2">
          <p className="text-xs text-blue-600 flex-1">Not ready to sign up yet?</p>
          <ShareLinkButton url={pageUrl} universityName={university.name} />
        </div>
      </div>

      {/* Task count */}
      {totalTasks > 0 && (
        <p className="text-xs text-gray-400 mb-4 px-1">
          {totalTasks} task{totalTasks !== 1 ? 's' : ''} across {orderedCategories.length + (uncategorised.length > 0 ? 1 : 0)} {orderedCategories.length + (uncategorised.length > 0 ? 1 : 0) !== 1 ? 'categories' : 'category'}
        </p>
      )}

      {totalTasks === 0 ? (
        <div className="text-center text-gray-400 py-16 bg-white rounded-2xl border border-gray-100 px-6">
          <p className="text-2xl mb-3">📋</p>
          <p className="text-base font-medium text-gray-600">Tasks coming soon</p>
          <p className="text-sm mt-2">{university.name} is setting up their checklist. Check back soon.</p>
        </div>
      ) : (
        <div className="space-y-7">
          {orderedCategories.map((cat) => {
            const catTasks = byCategory[cat] ?? []
            const style = categoryStyle(cat)
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className={`text-xs font-bold uppercase tracking-widest ${style.text}`}>
                    {cat}
                  </span>
                  <span className="text-xs text-gray-300">({catTasks.length})</span>
                </div>
                <ul className="space-y-2">
                  {catTasks.map((task) => {
                    const days = getDaysLeft(task.due_date)
                    return (
                      <li key={task.id}>
                        <Link
                          href={`/uni/${slug}/register`}
                          className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3.5 hover:shadow-md hover:border-gray-300 transition-all"
                        >
                          {/* Locked checkbox */}
                          <div className="w-5 h-5 rounded-full border-2 border-gray-200 shrink-0" />

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {task.title}
                            </p>
                          </div>

                          {task.due_date && (
                            <span className={`text-xs shrink-0 px-2 py-1 rounded-lg ${daysLeftStyle(days)}`}>
                              {daysLeftLabel(days, task.due_date)}
                            </span>
                          )}

                          {/* Lock icon */}
                          <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}

          {uncategorised.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Other
                </span>
                <span className="text-xs text-gray-300">({uncategorised.length})</span>
              </div>
              <ul className="space-y-2">
                {uncategorised.map((task) => {
                  const days = getDaysLeft(task.due_date)
                  return (
                    <li key={task.id}>
                      <Link
                        href={`/uni/${slug}/register`}
                        className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3.5 hover:shadow-md hover:border-gray-300 transition-all"
                      >
                        <div className="w-5 h-5 rounded-full border-2 border-gray-200 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                        </div>
                        {task.due_date && (
                          <span className={`text-xs shrink-0 px-2 py-1 rounded-lg ${daysLeftStyle(days)}`}>
                            {daysLeftLabel(days, task.due_date)}
                          </span>
                        )}
                        <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      <SignUpBanner slug={slug} />
    </div>
  )
}
