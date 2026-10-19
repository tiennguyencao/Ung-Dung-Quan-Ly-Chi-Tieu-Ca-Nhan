import nodemailer from 'nodemailer';

let cachedTransporter;
let cachedTransporterKey;

// Lazy + cached so a misconfigured/absent SMTP setup never breaks anything
// that doesn't need email, and a real transporter is authenticated once, not
// re-created on every password-reset request.
function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;

  const key = `${SMTP_HOST}:${SMTP_PORT}:${SMTP_USER}`;
  if (cachedTransporter && cachedTransporterKey === key) return cachedTransporter;

  cachedTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465, // 465 = implicit TLS; 587/25 use STARTTLS instead
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  cachedTransporterKey = key;
  return cachedTransporter;
}

// Only email this app ever sends. If it fails, the caller (auth.service.js)
// still returns its identical generic success message either way — a
// transient SMTP outage must never leak "this address exists" via a
// different response, and must never block the request either.
export async function sendPasswordResetEmail({ to, resetUrl }) {
  const transporter = getTransporter();

  if (!transporter) {
    // A raw reset token grants password-reset capability. It may be printed
    // only during local development, never in production or test logs.
    if (process.env.NODE_ENV === 'development') {
      console.log(`[dev only] Password reset link for ${to}: ${resetUrl}`);
    } else {
      console.warn('Password reset email is not configured; no reset email was sent.');
    }
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject: 'Reset your Sổ Chi Tiêu password',
      text: `Reset your password: ${resetUrl}\n\nThis link expires in 45 minutes. If you didn't request this, ignore this email.`,
      html: `<p>Reset your password by clicking the link below.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 45 minutes. If you didn't request this, ignore this email.</p>`,
    });
  } catch (error) {
    // Logged, not thrown: requestPasswordReset's response must stay identical
    // whether or not delivery actually succeeded (BR-10, account enumeration).
    console.error('Failed to send password reset email:', error.message);
  }
}
