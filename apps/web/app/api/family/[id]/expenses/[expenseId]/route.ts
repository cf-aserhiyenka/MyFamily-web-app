import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, MemberStatus, FamilyRole } from "@myfamily/db";
import { updateExpenseSchema } from "@myfamily/shared";

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
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
  const { id: familyId, expenseId } = await params;

  const access = await requireFinanceAccess(familyId);
  if (!access.ok) return access.response;

  const body = await request.json();
  const parsed = updateExpenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid expense data" }, { status: 400 });
  }

  const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
  if (!expense || expense.familyId !== familyId) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }

  if (parsed.data.budgetId) {
    const budget = await prisma.budget.findUnique({ where: { id: parsed.data.budgetId } });
    if (!budget || budget.familyId !== familyId) {
      return NextResponse.json({ error: "Invalid budget" }, { status: 400 });
    }
  }

  const updated = await prisma.expense.update({
    where: { id: expenseId },
    data: parsed.data,
  });

  return NextResponse.json({ id: updated.id });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
  const { id: familyId, expenseId } = await params;

  const access = await requireFinanceAccess(familyId);
  if (!access.ok) return access.response;

  const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
  if (!expense || expense.familyId !== familyId) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }

  await prisma.expense.delete({ where: { id: expenseId } });

  return NextResponse.json({ ok: true });
}
