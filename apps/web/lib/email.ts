import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(to: string, token: string) {
  const link = `${process.env.APP_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: "MyFamily <onboarding@resend.dev>",
    to,
    subject: "Confirm your email address",
    html: `<p>Click the link below to confirm your email address:</p><p><a href="${link}">${link}</a></p><p>This link expires in 1 hour.</p>`,
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const link = `${process.env.APP_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: "MyFamily <onboarding@resend.dev>",
    to,
    subject: "Reset your password",
    html: `<p>Click the link below to set a new password:</p><p><a href="${link}">${link}</a></p><p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>`,
  });
}
