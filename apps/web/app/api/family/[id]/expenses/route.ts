import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, MemberStatus, FamilyRole } from "@myfamily/db";
import { createExpenseSchema } from "@myfamily/shared";

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
  const parsed = createExpenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid expense data" }, { status: 400 });
  }

  const membership = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: session.user.id, familyId } },
  });

  if (!membership || membership.status !== MemberStatus.ACTIVE) {
    return NextResponse.json({ error: "You are not a member of this family" }, { status: 403 });
  }

  if (membership.role !== FamilyRole.PARENT && membership.role !== FamilyRole.GUARDIAN) {
    return NextResponse.json({ error: "Not permitted" }, { status: 403 });
  }

  const expense = await prisma.expense.create({
    data: {
      title: parsed.data.title,
      amount: parsed.data.amount,
      date: parsed.data.date,
      note: parsed.data.note,
      familyId,
      budgetId: parsed.data.budgetId ?? null,
      paidById: membership.id,
    },
  });

  return NextResponse.json({ id: expense.id }, { status: 201 });
}
