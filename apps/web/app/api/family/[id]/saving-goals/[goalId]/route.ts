import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, MemberStatus, FamilyRole } from "@myfamily/db";
import { updateSavingGoalSchema } from "@myfamily/shared";

async function requireFinanceAccess(familyId: string) {
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
  { params }: { params: Promise<{ id: string; goalId: string }> }
) {
  const { id: familyId, goalId } = await params;

  const access = await requireFinanceAccess(familyId);
  if (!access.ok) return access.response;

  const body = await request.json();
  const parsed = updateSavingGoalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid saving goal data" }, { status: 400 });
  }

  const goal = await prisma.savingGoal.findUnique({ where: { id: goalId } });
  if (!goal || goal.familyId !== familyId) {
    return NextResponse.json({ error: "Saving goal not found" }, { status: 404 });
  }

  const updated = await prisma.savingGoal.update({
    where: { id: goalId },
    data: parsed.data,
  });

  return NextResponse.json({ id: updated.id });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; goalId: string }> }
) {
  const { id: familyId, goalId } = await params;

  const access = await requireFinanceAccess(familyId);
  if (!access.ok) return access.response;

  const goal = await prisma.savingGoal.findUnique({
    where: { id: goalId },
    include: { _count: { select: { contributions: true } } },
  });
  if (!goal || goal.familyId !== familyId) {
    return NextResponse.json({ error: "Saving goal not found" }, { status: 404 });
  }

  if (goal._count.contributions > 0) {
    return NextResponse.json(
      { error: "Cannot delete a goal that already has contributions" },
      { status: 409 }
    );
  }

  await prisma.savingGoal.delete({ where: { id: goalId } });

  return NextResponse.json({ ok: true });
}
