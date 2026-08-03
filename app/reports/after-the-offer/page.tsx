import type { Metadata } from 'next'
import LeadForm from './LeadForm'

export const metadata: Metadata = {
  title: 'After the offer — Uni-Life whitepaper',
  description:
    'What 2,500 student conversations reveal about conversion risk in the post-offer, pre-arrival window. A 2025-cycle whitepaper from Uni-Life.',
}

const STATS = [
  { value: '2,426', label: 'offer-holder posts classified' },
  { value: '17', label: 'universities across 6 destinations' },
  { value: '107', label: 'nationalities of offer-holders' },
]

const TAKEAWAYS = [
  {
    title: 'An offer is no longer a signal of commitment',
    body: '57% of students apply to six or more universities, and 1 in 4 change their decision after receiving an offer. Students apply because they are still deciding — not because they have decided.',
  },
  {
    title: 'Feasibility drives the majority of decisions',
    body: 'Practical, urgent problem-solving — visas, housing, money, logistics — dominates offer-holder conversations. It is where confidence is won or lost, long before enrolment.',
  },
  {
    title: 'Information volume isn’t the gap',
    body: 'Communication is already high; it just isn’t landing where it needs to. The report maps the “dark funnel” of real questions students ask in moments of uncertainty.',
  },
]

export default function AfterTheOfferPage() {
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
              <span className="ul-eyebrow">Whitepaper · 2025 Cycle</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-5" style={{ letterSpacing: '-0.01em' }}>
              After the offer
            </h1>
            <p className="text-lg ul-fg2 leading-relaxed mb-8">
              What 2,500 student conversations reveal about conversion risk — and the
              “dark funnel” that shapes whether offer-holders actually enrol.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="text-3xl font-bold">{s.value}</p>
                  <p className="text-xs ul-fg2 leading-snug mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-5">
              {TAKEAWAYS.map((t) => (
                <div key={t.title} className="flex gap-3">
                  <span className="ul-dot" />
                  <div>
                    <p className="text-base font-semibold">{t.title}</p>
                    <p className="text-sm ul-fg2 leading-relaxed mt-0.5">{t.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-8 text-sm ul-muted">
              By Kasper Baars, Director of University Partnerships, Uni-Life.
            </p>
          </div>

          {/* Right: form card */}
          <div className="md:sticky md:top-8">
            <div className="ul-card ul-card-lg p-6 sm:p-8">
              <h2 className="text-xl font-semibold mb-1">Get Your Free Copy</h2>
              <p className="text-sm ul-fg2 mb-6">
                Enter your details and we’ll send the whitepaper straight to your inbox —
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
