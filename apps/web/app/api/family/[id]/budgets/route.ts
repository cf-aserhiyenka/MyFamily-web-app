import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@myfamily/db";
import { createBudgetSchema } from "@myfamily/shared";
import { getFamilyContext } from "@/lib/permissions";

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
  const parsed = createBudgetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid budget data" }, { status: 400 });
  }

  const context = await getFamilyContext(session.user.id, familyId);

  if (!context?.isActiveMember || !context.membership) {
    return NextResponse.json({ error: "You are not a member of this family" }, { status: 403 });
  }

  // Finance module is restricted to PARENT/GUARDIAN, per TODO/diamrams/4_module_finanse_rodzinne.txt
  if (!context.permissions?.manageFinance) {
    return NextResponse.json({ error: "Not permitted" }, { status: 403 });
  }

  const budget = await prisma.budget.create({
    data: {
      name: parsed.data.name,
      category: parsed.data.category,
      limitAmount: parsed.data.limitAmount,
      period: parsed.data.period,
      currency: "PLN",
      isActive: true,
      familyId,
      createdById: context.membership.id,
    },
  });

  return NextResponse.json({ id: budget.id }, { status: 201 });
}
