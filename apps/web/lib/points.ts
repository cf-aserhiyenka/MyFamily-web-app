import { prisma } from "@myfamily/db";

// Balance is not stored anywhere - it's always the sum of the member's
// point transactions (see TODO/diamrams/3, "Zrodlo prawdy o punktach").
export async function getPointsBalance(memberId: string): Promise<number> {
  const result = await prisma.pointTransaction.aggregate({
    where: { memberId },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}
