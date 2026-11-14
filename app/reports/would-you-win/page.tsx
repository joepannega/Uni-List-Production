import type { Metadata } from 'next'
import LeadForm from './LeadForm'

const OG_DESCRIPTION =
  'Watch the 21-minute Director’s Cut of our panel with admissions teams from SETU, Hasselt University and the British University of Vietnam, each recognised for their student experience.'

export const metadata: Metadata = {
  metadataBase: new URL('https://reports.uni-life.com'),
  title: 'If students judged your enrolment process, would you win? — Uni-Life webinar',
  description: OG_DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: 'Uni-Life',
    url: 'https://reports.uni-life.com/reports/would-you-win',
    title: 'If students judged your enrolment process, would you win? — Uni-Life webinar',
    description: OG_DESCRIPTION,
    images: [
      {
        url: '/og/would-you-win.png',
        width: 1200,
        height: 630,
        alt: 'If students judged your enrolment process, would you win? — a Uni-Life webinar',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'If students judged your enrolment process, would you win? — Uni-Life webinar',
    description: OG_DESCRIPTION,
    images: ['/og/would-you-win.png'],
  },
}

const STATS = [
  { value: '21 min', label: 'Director’s Cut of the full panel' },
  { value: '3', label: 'admissions teams recognised for their student experience' },
  { value: '3', label: 'countries: Ireland, Belgium and Vietnam' },
]

const TOPICS = [
  'How the journey from offer to arrival should feel to students',
  'Where AI fits in admissions — and where a person should take over',
  'Being honest early about visas, scholarships and paperwork',
  'What to measure beyond the enrolment number',
  'The one change every panelist would make first',
]

export default function WouldYouWinPage() {
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
              <span className="ul-eyebrow">Uni-Life Webinar · Director’s Cut</span>
            </div>
            <h1 className="text-4xl sm:text-[2.75rem] font-bold leading-tight mb-5" style={{ letterSpacing: '-0.01em' }}>
              If students judged your enrolment process, would you win?
            </h1>
            <p className="text-lg ul-fg2 leading-relaxed mb-8">
              A panel with admissions teams honoured in the Global Student Satisfaction
              Awards and the International Student Barometer, on what it takes to make the
              months after an offer feel human.
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
              What you’ll learn
            </p>
            <ol className="space-y-2.5">
              {TOPICS.map((topic, i) => (
                <li key={topic} className="flex gap-3 items-start">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: 'var(--ul-red-tint)', color: 'var(--ul-red)' }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium pt-0.5">{topic}</span>
                </li>
              ))}
            </ol>

            <p className="mt-8 text-sm ul-muted leading-relaxed">
              Hosted by Kasper Baars (Uni-Life), with Rachel Ni’Neill (SETU, Ireland), Hogne
              Ulla (Hasselt University, Belgium) and Trung Tran (British University of
              Vietnam).
            </p>
          </div>

          {/* Right: form card */}
          <div className="md:sticky md:top-8">
            <div className="ul-card ul-card-lg p-6 sm:p-8">
              <h2 className="text-xl font-semibold mb-1">Watch the Recording</h2>
              <p className="text-sm ul-fg2 mb-6">
                Enter your details to start watching straight away. We’ll also email you a
                link so you can come back to it later.
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
