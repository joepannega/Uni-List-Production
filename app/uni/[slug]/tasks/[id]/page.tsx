import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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
  return new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function getDaysLeft(dueDate: string | null): number | null {
  if (!dueDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.floor((new Date(dueDate).getTime() - today.getTime()) / 86400000)
}

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>
}) {
  const { slug, id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/uni/${slug}/login`)

  const { data: task } = await supabase
    .from('tasks')
    .select('id, title, description, due_date, category, url')
    .eq('id', id)
    .single()

  if (!task) notFound()

  const { data: completion } = await supabase
    .from('task_completions')
    .select('id, completed_at')
    .eq('task_id', id)
    .eq('user_id', user.id)
    .single()

  const isCompleted = !!completion
  const days = getDaysLeft(task.due_date)
  const cat = categoryStyle(task.category)

  async function markComplete() {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('task_completions').insert({ task_id: id, user_id: user.id })
    redirect(`/uni/${slug}/tasks/${id}`)
  }

  async function markIncomplete() {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('task_completions').delete().eq('task_id', id).eq('user_id', user.id)
    redirect(`/uni/${slug}/tasks/${id}`)
  }

  return (
    <div className="max-w-lg">
      <Link
        href={`/uni/${slug}/dashboard`}
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to checklist
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Coloured top bar based on category */}
        <div className={`h-1.5 w-full ${cat.bg.replace('bg-', 'bg-').replace('-100', '-400')}`} />

        <div className="p-6">
          {/* Category + status */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {task.category && (
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cat.bg} ${cat.text}`}>
                {task.category}
              </span>
            )}
            {isCompleted && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                Completed
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className={`text-xl font-bold mb-3 ${isCompleted ? 'line-through text-gray-400' : 'text-gray-900'}`}>
            {task.title}
          </h2>

          {/* Due date */}
          {task.due_date && (
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-500">{formatDate(task.due_date)}</span>
              {days !== null && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  days < 0 ? 'bg-red-100 text-red-600' :
                  days <= 7 ? 'bg-orange-100 text-orange-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days} days left`}
                </span>
              )}
            </div>
          )}

          {/* Description */}
          {task.description && (
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap mb-6">
              {task.description}
            </p>
          )}

          {/* More Info button */}
          {task.url && (
            <a
              href={task.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full border border-blue-200 text-blue-600 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-blue-50 transition-colors mb-3"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              More info
            </a>
          )}

          {/* Mark complete */}
          {isCompleted ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Marked as complete</span>
                {completion.completed_at && (
                  <span className="text-green-500 ml-auto text-xs">
                    {new Date(completion.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>
              <form action={markIncomplete}>
                <button type="submit" className="text-xs text-gray-400 hover:text-gray-600 underline w-full text-center py-1">
                  Mark as not done
                </button>
              </form>
            </div>
          ) : (
            <form action={markComplete}>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white rounded-xl px-4 py-3 text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Mark as complete
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Help text */}
      <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3.5 text-sm text-indigo-700 text-center">
        Need help? Contact the university or discuss it with other students on{' '}
        <span className="font-semibold">Uni-Life</span>.
      </div>
    </div>
  )
}
