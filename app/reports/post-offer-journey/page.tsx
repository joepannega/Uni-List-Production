import type { Metadata } from 'next'
import LeadForm from './LeadForm'

const OG_DESCRIPTION =
  'Seven practical lessons on turning accepted students into enrolled students, drawn from two Uni-Life panels with admissions leaders across Europe and Asia.'

export const metadata: Metadata = {
  metadataBase: new URL('https://reports.uni-life.com'),
  title: 'Designing the post-offer journey — Uni-Life guide',
  description: OG_DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: 'Uni-Life',
    url: 'https://reports.uni-life.com/reports/post-offer-journey',
    title: 'Designing the post-offer journey — Uni-Life guide',
    description: OG_DESCRIPTION,
    images: [
      {
        url: '/og/post-offer-journey.png',
        width: 1200,
        height: 630,
        alt: 'Designing the post-offer journey — a Uni-Life how-to guide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Designing the post-offer journey — Uni-Life guide',
    description: OG_DESCRIPTION,
    images: ['/og/post-offer-journey.png'],
  },
}

const STATS = [
  { value: '70%', label: 'named the post-offer phase their top challenge' },
  { value: '5', label: 'institutions across Ireland, Belgium, Sweden & Vietnam' },
  { value: '7', label: 'practical lessons for your team' },
]

const LESSONS = [
  'Reframe the offer as the start, not the finish',
  'Decide how the journey should feel',
  'Communicate like a human, at scale',
  'Build community before arrival',
  'Decide who owns the journey',
  'Know where AI fits — and where it doesn’t',
  'Say the hard things, then measure what matters',
]

export default function PostOfferJourneyPage() {
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
              <span className="ul-eyebrow">Uni-Life How-to Guide</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-5" style={{ letterSpacing: '-0.01em' }}>
              Designing the post-offer journey
            </h1>
            <p className="text-lg ul-fg2 leading-relaxed mb-8">
              Seven practical lessons on turning accepted students into enrolled students —
              drawn from two Uni-Life panels with admissions leaders across Europe and Asia.
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
              The seven lessons
            </p>
            <ol className="space-y-2.5">
              {LESSONS.map((lesson, i) => (
                <li key={lesson} className="flex gap-3 items-start">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: 'var(--ul-red-tint)', color: 'var(--ul-red)' }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium pt-0.5">{lesson}</span>
                </li>
              ))}
            </ol>

            <p className="mt-8 text-sm ul-muted leading-relaxed">
              A Uni-Life guide hosted by Kasper Baars, featuring admissions leaders from SETU
              (Ireland), Hasselt University (Belgium), British University of Vietnam, KdG
              University of Applied Sciences, and University West (Sweden).
            </p>
          </div>

          {/* Right: form card */}
          <div className="md:sticky md:top-8">
            <div className="ul-card ul-card-lg p-6 sm:p-8">
              <h2 className="text-xl font-semibold mb-1">Get Your Free Copy</h2>
              <p className="text-sm ul-fg2 mb-6">
                Enter your details and we’ll send the guide straight to your inbox —
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
