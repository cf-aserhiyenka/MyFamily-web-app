import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFamilyPermissions } from "@/lib/permissions";
import { prisma } from "@myfamily/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; invitationId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: familyId, invitationId } = await params;

  const permissions = await getFamilyPermissions(session.user.id, familyId);

  if (!permissions) {
    return NextResponse.json({ error: "Family not found" }, { status: 404 });
  }

  if (!permissions.canManageFamily) {
    return NextResponse.json({ error: "You cannot manage this family" }, { status: 403 });
  }

  const invitation = await prisma.familyInvitation.findUnique({ where: { id: invitationId } });

  if (!invitation || invitation.familyId !== familyId) {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }

  await prisma.familyInvitation.delete({ where: { id: invitationId } });

  return NextResponse.json({ ok: true }, { status: 200 });
}
