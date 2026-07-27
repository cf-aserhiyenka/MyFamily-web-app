import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFamilyPermissions } from "@/lib/permissions";
import { prisma, MemberStatus } from "@myfamily/db";
import { updateMemberRoleSchema } from "@myfamily/shared";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: familyId, memberId } = await params;

  const body = await request.json();
  const parsed = updateMemberRoleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const permissions = await getFamilyPermissions(session.user.id, familyId);

  if (!permissions) {
    return NextResponse.json({ error: "Family not found" }, { status: 404 });
  }

  if (!permissions.canManageFamily) {
    return NextResponse.json({ error: "You cannot manage this family" }, { status: 403 });
  }

  const member = await prisma.familyMember.findUnique({ where: { id: memberId } });

  if (!member || member.familyId !== familyId) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  await prisma.familyMember.update({
    where: { id: memberId },
    data: { role: parsed.data.role },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: familyId, memberId } = await params;

  const permissions = await getFamilyPermissions(session.user.id, familyId);

  if (!permissions) {
    return NextResponse.json({ error: "Family not found" }, { status: 404 });
  }

  if (!permissions.canManageFamily) {
    return NextResponse.json({ error: "You cannot manage this family" }, { status: 403 });
  }

  const family = await prisma.family.findUnique({
    where: { id: familyId },
    select: { createdById: true },
  });

  const member = await prisma.familyMember.findUnique({ where: { id: memberId } });

  if (!member || member.familyId !== familyId) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  if (member.userId === family?.createdById) {
    return NextResponse.json(
      { error: "The family owner cannot be removed. Delete the family instead." },
      { status: 400 }
    );
  }

  await prisma.familyMember.update({
    where: { id: memberId },
    data: { status: MemberStatus.REMOVED },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
