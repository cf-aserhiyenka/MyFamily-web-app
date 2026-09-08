import { prisma } from "@myfamily/db";

export async function getPointsBalance(memberId: string): Promise<number> {
  const result = await prisma.pointTransaction.aggregate({
    where: { memberId },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}
