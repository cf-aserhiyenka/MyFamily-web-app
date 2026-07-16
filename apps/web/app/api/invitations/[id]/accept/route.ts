import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, MemberStatus } from "@myfamily/db";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const [invitation, personNode] = await Promise.all([
    prisma.familyInvitation.findUnique({ where: { id } }),
    prisma.personNode.findUnique({ where: { userId: session.user.id } }),
  ]);

  if (
    !invitation ||
    invitation.email !== session.user.email ||
    invitation.usedAt ||
    invitation.declinedAt ||
    invitation.expiresAt < new Date()
  ) {
    return NextResponse.json({ error: "This invitation is no longer valid" }, { status: 400 });
  }

  // Same rule as creating a family: a family member needs a real person behind it.
  if (!personNode?.firstName || !personNode?.lastName || !personNode?.birthDate) {
    return NextResponse.json(
      { error: "Please complete your profile (first name, last name, birth date) first." },
      { status: 400 }
    );
  }

  const alreadyMember = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: session.user.id, familyId: invitation.familyId } },
  });

  if (alreadyMember) {
    return NextResponse.json({ error: "You are already a member of this family" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.familyMember.create({
      data: {
        userId: session.user.id,
        familyId: invitation.familyId,
        personNodeId: personNode.id,
        role: invitation.role,
        status: MemberStatus.ACTIVE,
      },
    }),
    prisma.familyInvitation.update({
      where: { id: invitation.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
