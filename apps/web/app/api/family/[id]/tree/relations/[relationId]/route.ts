import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@myfamily/db";
import { getFamilyContext } from "@/lib/permissions";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; relationId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: familyId, relationId } = await params;

  const context = await getFamilyContext(session.user.id, familyId);
  if (!context?.isActiveMember || !context.membership) {
    return NextResponse.json({ error: "You are not a member of this family" }, { status: 403 });
  }

  if (!context.permissions?.manageTree) {
    return NextResponse.json(
      { error: "Only parents or guardians can manage the family tree" },
      { status: 403 }
    );
  }

  const relation = await prisma.personRelation.findUnique({ where: { id: relationId } });
  if (!relation || relation.familyId !== familyId) {
    return NextResponse.json({ error: "Relation not found" }, { status: 404 });
  }

  await prisma.personRelation.delete({ where: { id: relationId } });

  return NextResponse.json({ ok: true });
}
