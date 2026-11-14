import type { Metadata } from 'next'
import Link from 'next/link'
import { verifyDownloadToken } from '@/lib/lead-token'

export const metadata: Metadata = {
  title: 'Bridging the Wait — Uni-Life webinar recording',
  robots: { index: false },
}

// TODO: replace with the unlisted YouTube/Vimeo embed URL. This SharePoint embed
// only plays for people signed in to Studyportals; outside visitors get a 403.
const VIDEO_EMBED_URL =
  'https://studyportalsbv.sharepoint.com/teams/UV/_layouts/15/embed.aspx?UniqueId=552ec680-771e-4bc6-b817-657289dce63c&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create'

export default async function WatchPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  const valid = token ? verifyDownloadToken(token) !== null : false

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

      <main className="flex-1 px-6 py-14">
        {valid ? (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <span className="ul-eyebrow">Uni-Life Webinar · Director’s Cut</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-3" style={{ letterSpacing: '-0.01em' }}>
              Bridging the Wait
            </h1>
            <p className="text-base ul-fg2 leading-relaxed mb-8">
              How to keep students engaged from application to arrival. We’ve also emailed
              you this link so you can come back to it later.
            </p>

            <div className="ul-card overflow-hidden" style={{ position: 'relative', paddingTop: '56.25%' }}>
              <iframe
                src={VIDEO_EMBED_URL}
                title="Bridging the Wait — Director’s Cut"
                allowFullScreen
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
              />
            </div>

            <div className="ul-card mt-10 p-6 sm:p-8 grid sm:grid-cols-[1fr_auto] gap-6 items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest ul-muted mb-2">
                  Keep reading
                </p>
                <p className="text-lg font-semibold mb-1">Designing the post-offer journey</p>
                <p className="text-sm ul-fg2 leading-relaxed">
                  Seven practical lessons drawn from this panel and a second session with
                  admissions leaders across Europe and Asia.
                </p>
              </div>
              <Link href="/reports/post-offer-journey" className="ul-btn">
                Get the Guide →
              </Link>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-3">This link has expired</h1>
            <p className="text-sm ul-fg2 leading-relaxed">
              Watch links stay valid for 7 days. Please{' '}
              <Link href="/reports/bridging-the-wait" className="ul-accent underline">
                request the recording again
              </Link>
              .
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
