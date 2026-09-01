import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@myfamily/db";
import { registerSchema } from "@myfamily/shared";
import { sendVerificationEmail } from "@/lib/email";

const VERIFICATION_LIFETIME_HOURS = 1;

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid registration data" },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return NextResponse.json(
      { error: "Email is already registered" },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const token = crypto.randomUUID();

  await prisma.$transaction(async (t) => {
    const user = await t.user.create({
      data: {
        email,
        passwordHash,
      },
    });

    await t.emailVerificationToken.create({
      data: {
        token,
        email,
        userId: user.id,
        expiresAt: new Date(Date.now() + VERIFICATION_LIFETIME_HOURS * 60 * 60 * 1000),
      },
    });
  });

  await sendVerificationEmail(email, token);

  return NextResponse.json({ ok: true }, { status: 201 });
}
