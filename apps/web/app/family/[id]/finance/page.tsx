import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, FamilyRole } from "@myfamily/db";
import { FinanceClient } from "./FinanceClient";

export default async function FinancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: familyId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const member = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: session.user.id, familyId } },
  });

  if (!member || member.status !== "ACTIVE") {
    notFound();
  }

  if (member.role !== FamilyRole.PARENT && member.role !== FamilyRole.GUARDIAN) {
    notFound();
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [budgets, savingGoals, recentExpenses, monthTotal, savingsTotal] = await Promise.all([
    prisma.budget.findMany({
      where: { familyId, isActive: true },
      include: { expenses: { select: { amount: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.savingGoal.findMany({
      where: { familyId },
      include: { contributions: { select: { amount: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.expense.findMany({
      where: { familyId },
      orderBy: { date: "desc" },
      take: 10,
      include: {
        paidBy: { include: { personNode: true } },
        budget: { select: { category: true } },
      },
    }),
    prisma.expense.aggregate({
      where: { familyId, date: { gte: startOfMonth, lt: startOfNextMonth } },
      _sum: { amount: true },
    }),
    prisma.goalContribution.aggregate({
      where: { goal: { familyId } },
      _sum: { amount: true },
    }),
  ]);

  return (
    <FinanceClient
      familyId={familyId}
      monthTotal={monthTotal._sum.amount?.toNumber() ?? 0}
      savingsTotal={savingsTotal._sum.amount?.toNumber() ?? 0}
      budgets={budgets.map((budget) => ({
        id: budget.id,
        name: budget.name,
        category: budget.category,
        period: budget.period,
        limitAmount: budget.limitAmount.toNumber(),
        spentAmount: budget.expenses.reduce((sum, expense) => sum + expense.amount.toNumber(), 0),
      }))}
      savingGoals={savingGoals.map((goal) => ({
        id: goal.id,
        name: goal.name,
        targetAmount: goal.targetAmount.toNumber(),
        currentAmount: goal.contributions.reduce((sum, c) => sum + c.amount.toNumber(), 0),
        deadline: goal.deadline ? goal.deadline.toISOString() : null,
        isAchieved: goal.isAchieved,
      }))}
      transactions={recentExpenses.map((expense) => ({
        id: expense.id,
        title: expense.title,
        amount: expense.amount.toNumber(),
        date: expense.date.toISOString(),
        note: expense.note,
        budgetId: expense.budgetId,
        payerName: `${expense.paidBy.personNode.firstName} ${expense.paidBy.personNode.lastName}`,
        budgetCategory: expense.budget?.category ?? null,
      }))}
    />
  );
}
