import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.EMAIL_FROM ?? 'Uni-List <onboarding@resend.dev>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function sendAdminPasswordResetEmail({
  to,
  resetLink,
}: {
  to: string
  resetLink: string
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Reset your Uni-List admin password',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">

          <!-- Header -->
          <tr>
            <td style="background:#111827;padding:28px 32px;">
              <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">
                🔐 Password reset
              </p>
              <p style="margin:6px 0 0;color:#9ca3af;font-size:14px;">
                Uni-List Admin
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 16px;font-size:15px;color:#111827;line-height:1.6;">
                Hi there,
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
                A password reset was requested for your Uni-List admin account. Click the button below to choose a new password. This link expires in 1 hour.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background:#111827;border-radius:12px;padding:14px 28px;">
                    <a href="${resetLink}" style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
                      Reset my password →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">Or copy this link into your browser:</p>
              <p style="margin:0 0 20px;font-size:12px;color:#6b7280;word-break:break-all;">${resetLink}</p>

              <p style="margin:0;font-size:13px;color:#9ca3af;">
                If you didn't request this, you can safely ignore this email — your password won't change.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #f3f4f6;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                Uni-List · Admin portal
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  })
}

export async function sendWelcomeEmail({
  to,
  universityName,
  slug,
}: {
  to: string
  universityName: string
  slug: string
}) {
  const checklistUrl = `${APP_URL}/uni/${slug}/dashboard`

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your ${universityName} arrival checklist`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">

          <!-- Header -->
          <tr>
            <td style="background:#1d4ed8;padding:28px 32px;">
              <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">
                ✅ Your arrival checklist
              </p>
              <p style="margin:6px 0 0;color:#93c5fd;font-size:14px;">
                ${universityName}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 16px;font-size:15px;color:#111827;line-height:1.6;">
                Hi there! 👋
              </p>
              <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
                You've created your checklist for ${universityName}. Bookmark this email — it's the easiest way to come back to your checklist at any time.
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
                Tick off tasks as you go, and we'll only show you the steps that matter for your situation.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background:#2563eb;border-radius:12px;padding:14px 28px;">
                    <a href="${checklistUrl}" style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
                      Open my checklist →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">Or copy this link into your browser:</p>
              <p style="margin:0;font-size:12px;color:#6b7280;word-break:break-all;">${checklistUrl}</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #f3f4f6;">
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
                You're receiving this because you created an account on the ${universityName} arrival checklist. Questions? Reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  })
}
