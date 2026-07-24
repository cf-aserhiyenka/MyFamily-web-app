import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, MemberStatus, FamilyRole } from "@myfamily/db";
import { createContributionSchema } from "@myfamily/shared";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: goalId } = await params;

  const body = await request.json();
  const parsed = createContributionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid contribution data" }, { status: 400 });
  }

  const goal = await prisma.savingGoal.findUnique({
    where: { id: goalId },
    select: { familyId: true },
  });

  if (!goal) {
    return NextResponse.json({ error: "Saving goal not found" }, { status: 404 });
  }

  const membership = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: session.user.id, familyId: goal.familyId } },
  });

  if (!membership || membership.status !== MemberStatus.ACTIVE) {
    return NextResponse.json({ error: "You are not a member of this family" }, { status: 403 });
  }

  if (membership.role !== FamilyRole.PARENT && membership.role !== FamilyRole.GUARDIAN) {
    return NextResponse.json({ error: "Not permitted" }, { status: 403 });
  }

  const contribution = await prisma.goalContribution.create({
    data: {
      amount: parsed.data.amount,
      note: parsed.data.note,
      contributedAt: new Date(),
      goalId,
      memberId: membership.id,
    },
  });

  return NextResponse.json({ id: contribution.id }, { status: 201 });
}
