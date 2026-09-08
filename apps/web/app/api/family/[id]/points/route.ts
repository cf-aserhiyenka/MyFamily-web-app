import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, MemberStatus } from "@myfamily/db";
import { getFamilyContext } from "@/lib/permissions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: familyId } = await params;

  const context = await getFamilyContext(session.user.id, familyId);
  if (!context?.isActiveMember || !context.membership) {
    return NextResponse.json({ error: "You are not a member of this family" }, { status: 403 });
  }

  const members = await prisma.familyMember.findMany({
    where: { familyId, status: MemberStatus.ACTIVE },
    include: { personNode: true },
    orderBy: { joinedAt: "asc" },
  });

  const sums = await prisma.pointTransaction.groupBy({
    by: ["memberId"],
    where: { memberId: { in: members.map((m) => m.id) } },
    _sum: { amount: true },
  });
  const balanceByMember = new Map(sums.map((s) => [s.memberId, s._sum.amount ?? 0]));

  return NextResponse.json({
    balances: members.map((m) => ({
      memberId: m.id,
      name: `${m.personNode.firstName} ${m.personNode.lastName}`,
      balance: balanceByMember.get(m.id) ?? 0,
    })),
  });
}
