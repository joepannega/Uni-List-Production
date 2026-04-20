import { notFound, redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getEffectiveUniversityId } from '@/lib/effective-university'
import { NATIONALITIES } from '@/lib/nationalities'
import CategorySelect from '@/app/admin/components/CategorySelect'
import IntakeSelect from '@/app/admin/components/IntakeSelect'

export default async function EditTaskPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const sp = await searchParams

  const universityId = await getEffectiveUniversityId()

  const admin = createAdminClient()

  const { data: task } = await admin
    .from('tasks')
    .select('id, title, description, due_date, category, url, intake')
    .eq('id', id)
    .single()

  if (!task) notFound()

  const { data: filters } = await admin
    .from('task_filters')
    .select('id, nationality')
    .eq('task_id', id)

  // Fetch existing categories for this university's tasks
  const { data: taskRows } = await admin
    .from('tasks')
    .select('category')
    .eq('university_id', universityId)
    .not('category', 'is', null)

  const existingCategories = [
    ...new Set((taskRows ?? []).map((t) => t.category as string)),
  ].sort()

  const { data: intakeRows } = await admin
    .from('tasks')
    .select('intake')
    .eq('university_id', universityId)
    .not('intake', 'is', null)

  const existingIntakes = [
    ...new Set((intakeRows ?? []).map((t) => t.intake as string)),
  ].sort()

  async function updateTask(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/admin/login')

    const title = (formData.get('title') as string).trim()
    const description = (formData.get('description') as string).trim()
    const due_date = formData.get('due_date') as string || null
    const category = (formData.get('category') as string).trim() || null
    const url = (formData.get('url') as string).trim() || null
    const intake = (formData.get('intake') as string).trim() || null

    const admin = createAdminClient()

    const { error } = await admin
      .from('tasks')
      .update({ title, description: description || null, due_date: due_date || null, category, url, intake })
      .eq('id', id)

    if (error) {
      redirect(`/admin/tasks/${id}/edit?error=${encodeURIComponent(error.message)}`)
    }

    // Replace filters entirely
    await admin.from('task_filters').delete().eq('task_id', id)

    const nationalities = formData.getAll('nationality') as string[]
    const filterRows = nationalities.map((nat) => ({
      task_id: id,
      nationality: nat || null,
    }))
    if (filterRows.length > 0) {
      await admin.from('task_filters').insert(filterRows)
    }

    redirect('/admin/tasks')
  }

  const existingFilters = filters ?? []

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Edit task</h2>

      <form action={updateTask} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {sp.error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{sp.error}</p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <CategorySelect categories={existingCategories} defaultValue={task.category ?? undefined} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
          <input
            name="title"
            type="text"
            required
            defaultValue={task.title}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link (More Info URL)</label>
          <input
            name="url"
            type="url"
            defaultValue={task.url ?? ''}
            placeholder="https://..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            rows={4}
            defaultValue={task.description ?? ''}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due date</label>
          <input
            name="due_date"
            type="date"
            defaultValue={task.due_date ?? ''}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Intake</label>
          <p className="text-xs text-gray-500 mb-2">
            Limit this task to a specific intake. Leave as "All intakes" to show it to every student.
          </p>
          <IntakeSelect intakes={existingIntakes} defaultValue={task.intake ?? undefined} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Who does this apply to?</label>
          <p className="text-xs text-gray-500 mb-3">
            "All students" shows to everyone. "Domestic" / "International" targets those groups. Or pick a specific nationality.
          </p>
          <select
            name="nationality"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            defaultValue={existingFilters[0]?.nationality ?? ''}
          >
            <option value="">All students</option>
            <option value="Domestic">Domestic students</option>
            <option value="International">International students</option>
            <option disabled>──────────────</option>
            {NATIONALITIES.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Save changes
          </button>
          <a
            href="/admin/tasks"
            className="bg-gray-100 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
