import './unilife-theme.css'

// Wraps every /reports page in the Uni-Life design system, scoped to this
// subtree so the Uni-List student app is unaffected.
export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="unilife">{children}</div>
}
