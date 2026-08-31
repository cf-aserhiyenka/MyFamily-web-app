import { NextResponse } from "next/server";
import { prisma } from "@myfamily/db";
import { forgotPasswordSchema } from "@myfamily/shared";
import { sendPasswordResetEmail } from "@/lib/email";

const RESET_LIFETIME_HOURS = 1;

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { email } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (user && user.isActive) {
    const token = crypto.randomUUID();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiresAt: new Date(Date.now() + RESET_LIFETIME_HOURS * 60 * 60 * 1000),
      },
    });

    await sendPasswordResetEmail(email, token);
  }

  return NextResponse.json({ ok: true });
}
