import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFamilyPermissions } from "@/lib/permissions";
import { prisma } from "@myfamily/db";
import { updateFamilySchema } from "@myfamily/shared";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: familyId } = await params;

  const body = await request.json();
  const parsed = updateFamilySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid family data" }, { status: 400 });
  }

  const permissions = await getFamilyPermissions(session.user.id, familyId);

  if (!permissions) {
    return NextResponse.json({ error: "Family not found" }, { status: 404 });
  }

  if (!permissions.canManageFamily) {
    return NextResponse.json({ error: "You cannot manage this family" }, { status: 403 });
  }

  const family = await prisma.family.update({
    where: { id: familyId },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
    },
  });

  return NextResponse.json({ id: family.id }, { status: 200 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: familyId } = await params;

  const permissions = await getFamilyPermissions(session.user.id, familyId);

  if (!permissions) {
    return NextResponse.json({ error: "Family not found" }, { status: 404 });
  }

  if (!permissions.canDeleteFamily) {
    return NextResponse.json({ error: "Only the family owner can delete it" }, { status: 403 });
  }

  await prisma.family.update({
    where: { id: familyId },
    data: { isActive: false, deletionRequestedAt: new Date() },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
