import type { Metadata } from 'next'
import LeadForm from './LeadForm'

const OG_DESCRIPTION =
  'What offer-holders and new students discuss on Uni-Life around the autumn intake: an analysis of 1,919 posts from 978 students at 12 universities.'

export const metadata: Metadata = {
  metadataBase: new URL('https://reports.uni-life.com'),
  title: 'What are students talking about? — Uni-Life data report',
  description: OG_DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: 'Uni-Life',
    url: 'https://reports.uni-life.com/reports/student-conversations',
    title: 'What are students talking about? — Uni-Life data report',
    description: OG_DESCRIPTION,
    images: [
      {
        url: '/og/student-conversations.png',
        width: 1200,
        height: 630,
        alt: 'What are students talking about? — a Uni-Life data report',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'What are students talking about? — Uni-Life data report',
    description: OG_DESCRIPTION,
    images: ['/og/student-conversations.png'],
  },
}

const STATS = [
  { value: '1,919', label: 'student posts analysed' },
  { value: '978', label: 'students who wrote them' },
  { value: '12', label: 'universities across five countries' },
]

const TAKEAWAYS = [
  {
    title: 'Housing dominates student worries',
    body: '24.2% of all posts are about housing, and the share stays high after September.',
  },
  {
    title: 'Connection peaks before arrival',
    body: 'Intros, friends and meetups make up 21.1% of posts, most of them before September.',
  },
  {
    title: 'The tone shifts once term starts',
    body: 'Positive posts fall from 28.8% to 19.6% as housing, admin and coursework take over.',
  },
]

export default function StudentConversationsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav — solid red, white content */}
      <header className="ul-nav">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="https://www.uni-life.com" aria-label="Uni-Life home" className="inline-block transition-opacity hover:opacity-80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/uni-life-logo-white.png" alt="Uni-Life" className="h-8 w-auto" />
          </a>
          <span className="text-xs text-white/80">Insights &amp; Reports</span>
        </div>
      </header>

      {/* Hero + form */}
      <section className="max-w-5xl mx-auto px-6 pt-14 pb-16">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left: pitch */}
          <div>
            <div className="mb-6">
              <span className="ul-eyebrow">Uni-Life Data Report</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-5" style={{ letterSpacing: '-0.01em' }}>
              What are students talking about?
            </h1>
            <p className="text-lg ul-fg2 leading-relaxed mb-8">
              What offer-holders and new students discuss on Uni-Life around the autumn
              intake, before and after the academic year begins — and what it means for
              your onboarding.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="text-3xl font-bold">{s.value}</p>
                  <p className="text-xs ul-fg2 leading-snug mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <p className="text-xs font-semibold uppercase tracking-widest ul-muted mb-4">
              Three takeaways
            </p>
            <ol className="space-y-4">
              {TAKEAWAYS.map((t, i) => (
                <li key={t.title} className="flex gap-3 items-start">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: 'var(--ul-red-tint)', color: 'var(--ul-red)' }}
                  >
                    {i + 1}
                  </span>
                  <span className="pt-0.5">
                    <span className="block text-sm font-semibold">{t.title}</span>
                    <span className="block text-sm ul-fg2 leading-relaxed mt-0.5">{t.body}</span>
                  </span>
                </li>
              ))}
            </ol>

            <p className="mt-8 text-sm ul-muted leading-relaxed">
              Based on posts written between 28 May and 24 November 2025 at 12 universities
              in the Netherlands, the UK, Ireland, Cyprus and France. Themes are classified by
              keyword and sentiment by lexicon scoring; the report explains the limits.
            </p>
          </div>

          {/* Right: form card */}
          <div className="md:sticky md:top-8">
            <div className="ul-card ul-card-lg p-6 sm:p-8">
              <h2 className="text-xl font-semibold mb-1">Get Your Free Copy</h2>
              <p className="text-sm ul-fg2 mb-6">
                Enter your details and we’ll send the report straight to your inbox —
                and give you instant access on the next screen.
              </p>
              <LeadForm />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="ul-bg-tint">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ul-fg2">
          <span>
            <strong className="font-semibold" style={{ color: 'var(--ul-black)' }}>Uni-Life</strong> — helping universities convert offer-holders
          </span>
          <span>© {new Date().getFullYear()} Uni-Life</span>
        </div>
      </footer>
    </div>
  )
}
