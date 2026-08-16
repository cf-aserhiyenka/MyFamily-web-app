import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, MemberStatus } from "@myfamily/db";
import { createPersonSchema } from "@myfamily/shared";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: familyId } = await params;

  const body = await request.json();
  const parsed = createPersonSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid person data" }, { status: 400 });
  }

  const membership = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: session.user.id, familyId } },
  });

  if (!membership || membership.status !== MemberStatus.ACTIVE) {
    return NextResponse.json({ error: "You are not a member of this family" }, { status: 403 });
  }

  const { firstName, lastName, birthDate, deathDate } = parsed.data;

  const person = await prisma.$transaction(async (tx) => {
    const created = await tx.personNode.create({
      data: {
        firstName,
        lastName,
        birthDate: birthDate ? new Date(birthDate) : null,
        deathDate: deathDate ? new Date(deathDate) : null,
        createdById: session.user.id,
      },
    });

    await tx.familyTreeMembership.create({
      data: { personId: created.id, familyId, addedById: membership.id },
    });

    return created;
  });

  return NextResponse.json({ id: person.id }, { status: 201 });
}
