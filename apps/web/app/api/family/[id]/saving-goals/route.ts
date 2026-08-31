import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@myfamily/db";
import { createSavingGoalSchema } from "@myfamily/shared";
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
  const parsed = createSavingGoalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid saving goal data" }, { status: 400 });
  }

  const context = await getFamilyContext(session.user.id, familyId);

  if (!context?.isActiveMember || !context.membership) {
    return NextResponse.json({ error: "You are not a member of this family" }, { status: 403 });
  }

  if (!context.permissions?.manageFinance) {
    return NextResponse.json({ error: "Not permitted" }, { status: 403 });
  }

  const goal = await prisma.savingGoal.create({
    data: {
      name: parsed.data.name,
      targetAmount: parsed.data.targetAmount,
      deadline: parsed.data.deadline,
      currency: "PLN",
      isAchieved: false,
      familyId,
      createdById: context.membership.id,
    },
  });

  return NextResponse.json({ id: goal.id }, { status: 201 });
}
