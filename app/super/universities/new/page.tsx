import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { NATIONALITIES } from '@/lib/nationalities'

export default async function NewUniversityPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const sp = await searchParams

  async function createUniversity(formData: FormData) {
    'use server'
    const name = (formData.get('name') as string).trim()
    const slug = (formData.get('slug') as string).trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')
    const home_country = (formData.get('home_country') as string).trim()

    const admin = createAdminClient()
    const { data: uni, error } = await admin
      .from('universities')
      .insert({ name, slug, home_country })
      .select('id')
      .single()

    if (error || !uni) {
      redirect(`/super/universities/new?error=${encodeURIComponent(error?.message ?? 'Failed')}`)
    }

    redirect(`/super/universities/${uni.id}`)
  }

  return (
    <div className="max-w-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Add university</h2>

      <form action={createUniversity} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        {sp.error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{sp.error}</p>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">University name</label>
          <input
            name="name"
            type="text"
            required
            placeholder="e.g. University of Oxford"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL slug</label>
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
            <span className="px-3 py-2 text-sm text-gray-400 bg-gray-50 border-r border-gray-300 whitespace-nowrap">/uni/</span>
            <input
              name="slug"
              type="text"
              required
              pattern="[a-z0-9-]+"
              placeholder="oxford"
              className="flex-1 px-3 py-2 text-sm focus:outline-none"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Lowercase letters, numbers, and hyphens only.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Home country</label>
          <p className="text-xs text-gray-400 mb-2">Students from this nationality are treated as domestic; all others are "International".</p>
          <select
            name="home_country"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {NATIONALITIES.filter(n => n !== 'International').map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Create
          </button>
          <a
            href="/super"
            className="bg-gray-100 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
