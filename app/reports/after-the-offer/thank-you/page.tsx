import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Your whitepaper is ready — Uni-Life',
  robots: { index: false },
}

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  const downloadUrl = token
    ? `/reports/after-the-offer/download?token=${encodeURIComponent(token)}`
    : null

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="ul-nav">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="https://www.uni-life.com" aria-label="Uni-Life home" className="inline-block transition-opacity hover:opacity-80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/uni-life-logo-white.png" alt="Uni-Life" className="h-8 w-auto" />
          </a>
          <span className="text-xs text-white/80">Insights &amp; Reports</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md text-center">
          <div
            className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: 'var(--ul-red-tint)' }}
          >
            <svg
              className="h-7 w-7"
              style={{ color: 'var(--ul-red)' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold mb-3">You’re All Set</h1>
          <p className="text-sm ul-fg2 leading-relaxed mb-8">
            Your copy of <strong className="font-semibold" style={{ color: 'var(--ul-black)' }}>After the offer</strong>{' '}
            is ready. We’ve also emailed you the link — check your inbox (and your spam
            folder, just in case).
          </p>

          {downloadUrl ? (
            <a href={downloadUrl} className="ul-btn w-full">
              Download the Whitepaper →
            </a>
          ) : (
            <p className="text-sm ul-fg2">
              Your download link has expired. Please{' '}
              <Link href="/reports/after-the-offer" className="ul-accent underline">
                request the whitepaper again
              </Link>
              .
            </p>
          )}

          <p className="mt-6 text-xs ul-muted">
            Questions? Reply to the email and it’ll reach the Uni-Life team.
          </p>
        </div>
      </main>
    </div>
  )
}
