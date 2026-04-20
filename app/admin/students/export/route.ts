import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function escapeCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  // Wrap in quotes if it contains commas, quotes, or newlines
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function lastActiveLabel(lastSignIn: string | null, createdAt: string): string {
  if (!lastSignIn) return 'Never logged in'
  const signInMs  = new Date(lastSignIn).getTime()
  const createdMs = new Date(createdAt).getTime()
  const nowMs     = Date.now()
  const neverReturned = signInMs - createdMs < 5 * 60 * 1000
  const daysAgo = Math.floor((nowMs - signInMs) / (1000 * 60 * 60 * 24))
  if (neverReturned && daysAgo > 0) return 'Never returned'
  if (daysAgo === 0) return 'Active today'
  if (daysAgo === 1) return 'Active yesterday'
  return `Active ${daysAgo} days ago`
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('university_id')
    .eq('id', user.id)
    .single()
  if (!profile?.university_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  // Fetch students
  const { data: students } = await admin
    .from('users')
    .select('id, email, nationality, intake, created_at')
    .eq('university_id', profile.university_id)
    .eq('role', 'student')
    .order('created_at', { ascending: false })

  // Fetch all tasks
  const { data: tasks } = await admin
    .from('tasks')
    .select('id')
    .eq('university_id', profile.university_id)

  const totalTasks = tasks?.length ?? 0
  const studentIds = students?.map((s) => s.id) ?? []
  const taskIds    = tasks?.map((t) => t.id) ?? []

  // Completion counts
  const completionCounts = new Map<string, number>()
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

  // Last sign-in from Auth
  const lastSignInMap = new Map<string, string | null>()
  if (studentIds.length > 0) {
    const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 })
    const studentIdSet = new Set(studentIds)
    for (const authUser of authData?.users ?? []) {
      if (studentIdSet.has(authUser.id)) {
        lastSignInMap.set(authUser.id, authUser.last_sign_in_at ?? null)
      }
    }
  }

  // Build CSV rows
  const headers = [
    'Email',
    'Nationality',
    'Intake',
    'Joined',
    'Last Active',
    'Tasks Completed',
    'Total Tasks',
    'Progress (%)',
  ]

  const rows = (students ?? []).map((s) => {
    const done    = completionCounts.get(s.id) ?? 0
    const pct     = totalTasks > 0 ? Math.round((done / totalTasks) * 100) : 0
    const signIn  = lastSignInMap.get(s.id) ?? null
    const active  = lastActiveLabel(signIn, s.created_at)
    return [
      s.email,
      s.nationality ?? '',
      s.intake ?? '',
      formatDate(s.created_at),
      active,
      done,
      totalTasks,
      pct,
    ].map(escapeCell).join(',')
  })

  const csv = [headers.join(','), ...rows].join('\r\n')

  const date = new Date().toISOString().slice(0, 10)
  const filename = `students-${date}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
