// Email client using Resend
import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@swipebetter.ai';

export function getResendClient() {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable is required');
  }
  return {
    client: new Resend(RESEND_API_KEY),
    fromEmail: FROM_EMAIL
  };
}

export async function sendPasswordResetEmail(to: string, resetToken: string, firstName?: string | null) {
  const { client, fromEmail } = getResendClient();
  
  // Determine base URL: prioritize APP_URL, then dev domain, then fallback
  let baseUrl: string;
  if (process.env.APP_URL) {
    baseUrl = process.env.APP_URL;
  } else if (process.env.REPLIT_DEV_DOMAIN) {
    baseUrl = `https://${process.env.REPLIT_DEV_DOMAIN}`;
  } else {
    baseUrl = 'https://swipebetter.ai';
  }
  // Ensure no trailing slash
  baseUrl = baseUrl.replace(/\/$/, '');
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
  console.log(`[Email] Sending password reset to ${to} with URL: ${resetUrl}`);
  const name = firstName || 'there';
  
  await client.emails.send({
    from: fromEmail,
    to: [to],
    subject: 'Reset your SwipeBetter password',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #ec4899; margin-bottom: 24px;">Reset Your Password</h2>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hey ${name},</p>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">SwipeBetter - Improve your dating game</p>
      </div>
    `,
  });
}
