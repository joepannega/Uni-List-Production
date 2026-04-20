import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role, university_id')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'super_admin') redirect('/super')
    if (profile?.role === 'admin') redirect('/admin/tasks')

    if (profile?.role === 'student' && profile.university_id) {
      const admin = createAdminClient()
      const { data: uni } = await admin
        .from('universities')
        .select('slug')
        .eq('id', profile.university_id)
        .single()
      if (uni) redirect(`/uni/${uni.slug}/dashboard`)
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* Nav */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-bold text-gray-900 text-lg tracking-tight">Uni-List</span>
          <span className="text-xs text-gray-400">A free service by Uni-Life</span>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
          Making your university journey smoother
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
          Your university arrival,<br className="hidden sm:block" /> made simple.
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Uni-List is a free checklist tool built by the Uni-Life team to help students
          navigate everything they need to do before and after arriving at university —
          personalised to their nationality and situation.
        </p>
      </section>

      {/* App mock — dashboard */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-6 items-start">

          {/* Mock: Dashboard */}
          <div className="rounded-2xl border border-gray-200 shadow-lg overflow-hidden text-left">
            {/* Mock browser bar */}
            <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-gray-300" />
                <div className="w-3 h-3 rounded-full bg-gray-300" />
                <div className="w-3 h-3 rounded-full bg-gray-300" />
              </div>
              <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-400 mx-2">
                uni-list.com/uni/your-university/dashboard
              </div>
            </div>
            {/* Mock nav */}
            <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-2">
              <span className="font-semibold text-gray-800 text-sm">Your University</span>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-400">Uni-List</span>
            </div>
            {/* Mock content */}
            <div className="bg-gray-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900">Your checklist</p>
                  <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">International</span>
                </div>
                <span className="text-xs text-gray-400">Settings</span>
              </div>
              {/* Progress card */}
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Your progress</p>
                    <p className="text-xs text-gray-400">3 of 8 tasks completed</p>
                  </div>
                  <span className="text-lg font-bold text-blue-600">38%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full w-[38%]" style={{ background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }} />
                </div>
              </div>
              {/* Filter chips */}
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-900 text-white">All</span>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-white text-gray-600 border border-gray-200">Visa & Immigration</span>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-white text-gray-600 border border-gray-200">Accommodation</span>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-white text-gray-600 border border-gray-200">IT Setup</span>
              </div>
              {/* Task items */}
              <div className="space-y-2">
                {[
                  { label: 'Register your visa with the university', cat: 'Visa & Immigration', catBg: 'bg-red-100', catText: 'text-red-700', done: true },
                  { label: 'Set up your student email account', cat: 'IT Setup', catBg: 'bg-violet-100', catText: 'text-violet-700', done: true },
                  { label: 'Book airport pickup or arrange transport', cat: 'Accommodation', catBg: 'bg-orange-100', catText: 'text-orange-700', done: false },
                  { label: 'Collect your student ID card', cat: 'Getting Started', catBg: 'bg-blue-100', catText: 'text-blue-700', done: false },
                ].map((task, i) => (
                  <div key={i} className={`flex items-center gap-3 bg-white rounded-xl border px-3 py-2.5 ${task.done ? 'opacity-50 border-gray-100' : 'border-gray-200'}`}>
                    <div className={`w-4 h-4 rounded shrink-0 border-2 flex items-center justify-center ${task.done ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                      {task.done && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${task.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>{task.label}</p>
                      <span className={`inline-block mt-0.5 text-xs px-1.5 py-0.5 rounded-full ${task.catBg} ${task.catText}`}>{task.cat}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mock: Task detail */}
          <div className="rounded-2xl border border-gray-200 shadow-lg overflow-hidden text-left">
            <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-gray-300" />
                <div className="w-3 h-3 rounded-full bg-gray-300" />
                <div className="w-3 h-3 rounded-full bg-gray-300" />
              </div>
              <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-400 mx-2">
                uni-list.com/uni/your-university/tasks/…
              </div>
            </div>
            <div className="bg-white border-b border-gray-100 px-4 py-3">
              <span className="text-xs text-blue-600 font-medium">← Back to checklist</span>
            </div>
            <div className="bg-gray-50 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <span className="inline-block mt-0.5 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700 shrink-0">Visa & Immigration</span>
              </div>
              <h3 className="text-sm font-bold text-gray-900">Register your visa with the university</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-orange-50 text-orange-600 font-semibold px-2 py-0.5 rounded-lg">5 days left</span>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-700">What you need to do</p>
                <p className="text-xs text-gray-500 leading-relaxed">You must register your visa with the university's international student office within 7 days of arrival. Bring your passport, BRP card, and university acceptance letter.</p>
                <p className="text-xs text-gray-500 leading-relaxed">Head to the Student Services building, ground floor, Room G04. Opening hours are Mon–Fri, 9am–4pm.</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-3">
                <p className="text-xs font-semibold text-gray-700 mb-2">Useful links</p>
                <div className="flex items-center gap-2 text-xs text-blue-600">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  International Student Office →
                </div>
              </div>
              <button className="w-full bg-blue-600 text-white text-xs font-semibold py-2.5 rounded-xl">
                Mark as complete
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Problem */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">The challenge</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 max-w-xl">
            Starting university involves a lot of moving parts.
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: '🛂', label: 'Visa registration' },
              { icon: '🏠', label: 'Accommodation check-in' },
              { icon: '💻', label: 'IT accounts & email' },
              { icon: '🏦', label: 'Bank account setup' },
              { icon: '📋', label: 'Enrollment & induction' },
              { icon: '🚌', label: 'Getting to campus' },
              { icon: '📱', label: 'Student apps & portals' },
              { icon: '🧾', label: 'Documents & ID cards' },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-sm mt-5 max-w-xl">
            Every university has its own processes. Information is scattered across emails, PDFs, and portals. Uni-List brings it all into one place.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">How it works</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-10">Three steps to a clear arrival plan.</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Uni-Life builds your checklist',
                body: 'Our team reads through your university\'s official guides, websites, and documents and turns them into a structured, step-by-step checklist.',
              },
              {
                step: '02',
                title: 'You register and personalise',
                body: 'Create a free account with your email. Tell us your nationality and we\'ll filter out the tasks that don\'t apply to you — no clutter, just what matters.',
              },
              {
                step: '03',
                title: 'Tick off tasks at your pace',
                body: 'Work through your checklist before and after you arrive. Each task has clear instructions and links. Track your progress as you go.',
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <p className="text-4xl font-bold text-gray-100 mb-3">{item.step}</p>
                <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Features</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-10">Built for students, not universities.</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { icon: '🌍', title: 'Personalised by nationality', body: 'Domestic and international students see different tasks. Specific countries too.' },
              { icon: '📅', title: 'Organised by deadline', body: 'Tasks are grouped by urgency so you always know what to tackle first.' },
              { icon: '📂', title: 'Filter by category', body: 'Focus on visa tasks, accommodation, IT setup — whatever you need right now.' },
              { icon: '📲', title: 'Works on your phone', body: 'Add it to your home screen and access your checklist like a native app.' },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl border border-gray-200 p-5">
                <span className="text-2xl mb-3 block">{f.icon}</span>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 bg-blue-50 rounded-2xl border border-blue-100 px-5 py-4 flex items-center gap-3">
            <span className="text-2xl">🆓</span>
            <p className="text-sm text-blue-800"><strong>Completely free.</strong> Uni-List has no business model. It's a free service built by the Uni-Life team to make student arrivals less stressful.</p>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-xl shrink-0">⚠️</span>
              <div>
                <p className="text-sm font-bold text-amber-900">Important notice</p>
                <p className="text-xs text-amber-700 mt-0.5">Please read before using Uni-List</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-amber-800 leading-relaxed">
              <p>Uni-List is built and maintained by the <strong>Uni-Life team</strong> — it is not an official product of any university. Checklists are compiled based on publicly available guides, websites, and documents provided by universities, but are not verified or endorsed by them.</p>
              <p>While we do our best to keep information accurate and up to date, you should always verify each step directly with your university. Uni-Life does not accept responsibility for any errors, omissions, or incomplete tasks.</p>
              <p>If in doubt, contact your university's international student office or student services team directly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <span><strong className="text-gray-600">Uni-List</strong> — a free service by Uni-Life</span>
          <span>Not affiliated with any university · Built to help students</span>
        </div>
      </footer>

    </div>
  )
}
