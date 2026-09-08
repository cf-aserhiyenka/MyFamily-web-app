import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, MemberStatus, FamilyRole } from "@myfamily/db";
import { updateRewardSchema } from "@myfamily/shared";

async function requireRewardAccess(familyId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false as const, response: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
  }

  const membership = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: session.user.id, familyId } },
  });

  if (!membership || membership.status !== MemberStatus.ACTIVE) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "You are not a member of this family" }, { status: 403 }),
    };
  }
  if (membership.role !== FamilyRole.PARENT && membership.role !== FamilyRole.GUARDIAN) {
    return { ok: false as const, response: NextResponse.json({ error: "Not permitted" }, { status: 403 }) };
  }

  return { ok: true as const, membership };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; rewardId: string }> }
) {
  const { id: familyId, rewardId } = await params;

  const access = await requireRewardAccess(familyId);
  if (!access.ok) return access.response;

  const body = await request.json();
  const parsed = updateRewardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid reward data" }, { status: 400 });
  }

  const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
  if (!reward || reward.familyId !== familyId) {
    return NextResponse.json({ error: "Reward not found" }, { status: 404 });
  }

  const updated = await prisma.reward.update({
    where: { id: rewardId },
    data: parsed.data,
  });

  return NextResponse.json({ id: updated.id });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; rewardId: string }> }
) {
  const { id: familyId, rewardId } = await params;

  const access = await requireRewardAccess(familyId);
  if (!access.ok) return access.response;

  const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
  if (!reward || reward.familyId !== familyId) {
    return NextResponse.json({ error: "Reward not found" }, { status: 404 });
  }

  await prisma.reward.update({ where: { id: rewardId }, data: { isActive: false } });

  return NextResponse.json({ ok: true });
}
