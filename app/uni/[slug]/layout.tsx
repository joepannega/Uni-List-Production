import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'

export default async function UniLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const admin = createAdminClient()

  const { data: university } = await admin
    .from('universities')
    .select('id, name, slug')
    .eq('slug', slug)
    .single()

  if (!university) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-2">
          <span className="font-semibold text-gray-900">{university.name}</span>
          <span className="text-gray-400">·</span>
          <span className="text-sm text-gray-500">Uni-List</span>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
