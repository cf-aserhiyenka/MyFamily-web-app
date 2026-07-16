import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, MemberStatus } from "@myfamily/db";
import { createInvitationSchema } from "@myfamily/shared";

const INVITATION_LIFETIME_DAYS = 7;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: familyId } = await params;

  const body = await request.json();
  const parsed = createInvitationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid invitation data" }, { status: 400 });
  }

  // Only an active member of the family can invite others to it.
  const membership = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: session.user.id, familyId } },
  });

  if (!membership || membership.status !== MemberStatus.ACTIVE) {
    return NextResponse.json({ error: "You are not a member of this family" }, { status: 403 });
  }

  const invitation = await prisma.familyInvitation.create({
    data: {
      email: parsed.data.email,
      role: parsed.data.role,
      token: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + INVITATION_LIFETIME_DAYS * 24 * 60 * 60 * 1000),
      familyId,
      invitedById: membership.id,
    },
  });

  return NextResponse.json({ id: invitation.id }, { status: 201 });
}
