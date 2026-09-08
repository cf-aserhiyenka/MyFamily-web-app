import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, TransactionType } from "@myfamily/db";
import { getFamilyContext } from "@/lib/permissions";
import { manualPointAdjustmentSchema } from "@myfamily/shared";

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
  const parsed = manualPointAdjustmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid adjustment data" }, { status: 400 });
  }

  const context = await getFamilyContext(session.user.id, familyId);
  if (!context?.isActiveMember || !context.membership) {
    return NextResponse.json({ error: "You are not a member of this family" }, { status: 403 });
  }
  if (!context.permissions?.manageTasks) {
    return NextResponse.json({ error: "Only parents or guardians can adjust points" }, { status: 403 });
  }

  const member = await prisma.familyMember.findUnique({
    where: { id: parsed.data.memberId },
  });
  if (!member || member.familyId !== familyId) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const transaction = await prisma.pointTransaction.create({
    data: {
      amount: parsed.data.amount,
      type: TransactionType.MANUAL_ADJUSTMENT,
      reason: parsed.data.reason,
      memberId: member.id,
    },
  });

  return NextResponse.json({ id: transaction.id }, { status: 201 });
}
