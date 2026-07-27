import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, MemberStatus, FamilyRole } from "@myfamily/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: familyId } = await params;

  const family = await prisma.family.findUnique({
    where: { id: familyId },
    select: { createdById: true },
  });

  if (!family) {
    return NextResponse.json({ error: "Family not found" }, { status: 404 });
  }

  if (family.createdById === session.user.id) {
    return NextResponse.json(
      { error: "The family owner cannot leave the family. Delete the family instead." },
      { status: 400 }
    );
  }

  const membership = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: session.user.id, familyId } },
  });

  if (!membership || membership.status !== MemberStatus.ACTIVE) {
    return NextResponse.json({ error: "You are not a member of this family" }, { status: 403 });
  }

  if (membership.role === FamilyRole.CHILD) {
    return NextResponse.json(
      { error: "A child cannot leave the family on their own. Ask a parent to remove you instead." },
      { status: 400 }
    );
  }

  await prisma.familyMember.update({
    where: { id: membership.id },
    data: { status: MemberStatus.LEFT },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
