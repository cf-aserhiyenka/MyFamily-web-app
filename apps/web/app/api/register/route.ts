import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@myfamily/db";
import { registerSchema } from "@myfamily/shared";

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

  await prisma.user.create({
    data: {
      email,
      passwordHash,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
