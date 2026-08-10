import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, MemberStatus, FamilyRole } from "@myfamily/db";
import { updateBudgetSchema } from "@myfamily/shared";

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
  { params }: { params: Promise<{ id: string; budgetId: string }> }
) {
  const { id: familyId, budgetId } = await params;

  const access = await requireFinanceAccess(familyId);
  if (!access.ok) return access.response;

  const body = await request.json();
  const parsed = updateBudgetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid budget data" }, { status: 400 });
  }

  const budget = await prisma.budget.findUnique({ where: { id: budgetId } });
  if (!budget || budget.familyId !== familyId) {
    return NextResponse.json({ error: "Budget not found" }, { status: 404 });
  }

  const updated = await prisma.budget.update({
    where: { id: budgetId },
    data: parsed.data,
  });

  return NextResponse.json({ id: updated.id });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; budgetId: string }> }
) {
  const { id: familyId, budgetId } = await params;

  const access = await requireFinanceAccess(familyId);
  if (!access.ok) return access.response;

  const budget = await prisma.budget.findUnique({ where: { id: budgetId } });
  if (!budget || budget.familyId !== familyId) {
    return NextResponse.json({ error: "Budget not found" }, { status: 404 });
  }

  await prisma.budget.update({ where: { id: budgetId }, data: { isActive: false } });

  return NextResponse.json({ ok: true });
}
