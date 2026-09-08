import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, TransactionType } from "@myfamily/db";
import { getPointsBalance } from "@/lib/points";
import { getFamilyContext } from "@/lib/permissions";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: rewardId } = await params;

  const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
  if (!reward) {
    return NextResponse.json({ error: "Reward not found" }, { status: 404 });
  }

  const context = await getFamilyContext(session.user.id, reward.familyId);
  if (!context?.isActiveMember || !context.membership) {
    return NextResponse.json({ error: "You are not a member of this family" }, { status: 403 });
  }
  const membership = context.membership;

  if (!reward.isActive) {
    return NextResponse.json({ error: "This reward is not available" }, { status: 400 });
  }
  if (reward.stock !== null && reward.stock <= 0) {
    return NextResponse.json({ error: "This reward is out of stock" }, { status: 400 });
  }

  const balance = await getPointsBalance(membership.id);
  if (balance < reward.pointCost) {
    return NextResponse.json({ error: "Not enough points" }, { status: 400 });
  }

  const redemption = await prisma.$transaction(async (tx) => {
    if (reward.stock !== null) {
      await tx.reward.update({
        where: { id: reward.id },
        data: { stock: { decrement: 1 } },
      });
    }

    const created = await tx.rewardRedemption.create({
      data: {
        rewardId: reward.id,
        memberId: membership.id,
        pointsSpent: reward.pointCost,
      },
    });

    await tx.pointTransaction.create({
      data: {
        amount: -reward.pointCost,
        type: TransactionType.REWARD_REDEMPTION,
        reason: `Redeemed reward: ${reward.name}`,
        memberId: membership.id,
        redemptionId: created.id,
      },
    });

    return created;
  });

  return NextResponse.json({ id: redemption.id }, { status: 201 });
}
