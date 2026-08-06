import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@myfamily/db";
import { updateProfileSchema } from "@myfamily/shared";

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid profile data" }, { status: 400 });
  }

  const { firstName, lastName, birthDate, avatarBase64 } = parsed.data;

  await prisma.personNode.upsert({
    where: { userId: session.user.id },
    update: {
      firstName,
      lastName,
      birthDate: birthDate ? new Date(birthDate) : null,
      avatarBase64,
    },
    create: {
      firstName,
      lastName,
      birthDate: birthDate ? new Date(birthDate) : null,
      userId: session.user.id,
      createdById: session.user.id,
      avatarBase64,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const ownedFamily = await prisma.family.findFirst({
    where: { createdById: session.user.id, isActive: true },
    select: { id: true },
  });

  if (ownedFamily) {
    return NextResponse.json(
      { error: "Delete or transfer the families you own before deleting your account." },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { isActive: false },
  });

  return NextResponse.json({ ok: true });
}
