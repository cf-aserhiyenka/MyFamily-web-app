import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, FamilyRole } from "@myfamily/db";
import { TasksClient } from "./TasksClient";

export default async function TasksPage({ params }: { params: Promise<{ id: string }> }) {
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

  const canManageTasks = member.role === FamilyRole.PARENT || member.role === FamilyRole.GUARDIAN;

  const [tasks, members, rewards, pointSums] = await Promise.all([
    prisma.task.findMany({
      where: { familyId },
      orderBy: { createdAt: "desc" },
      include: {
        assignee: { include: { personNode: true } },
        createdBy: { include: { personNode: true } },
      },
    }),
    prisma.familyMember.findMany({
      where: { familyId, status: "ACTIVE" },
      include: { personNode: true },
      orderBy: { joinedAt: "asc" },
    }),
    prisma.reward.findMany({
      where: { familyId, isActive: true },
      orderBy: { pointCost: "asc" },
    }),
    prisma.pointTransaction.groupBy({
      by: ["memberId"],
      where: { member: { familyId, status: "ACTIVE" } },
      _sum: { amount: true },
    }),
  ]);

  const balanceByMember = new Map(pointSums.map((s) => [s.memberId, s._sum.amount ?? 0]));

  return (
    <TasksClient
      familyId={familyId}
      myMemberId={member.id}
      canManageTasks={canManageTasks}
      members={members.map((m) => ({
        id: m.id,
        name: `${m.personNode.firstName} ${m.personNode.lastName}`,
      }))}
      initialTasks={tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        points: task.points,
        dueDate: task.dueDate ? task.dueDate.toISOString() : null,
        assigneeId: task.assigneeId,
        assigneeName: task.assignee
          ? `${task.assignee.personNode.firstName} ${task.assignee.personNode.lastName}`
          : null,
        createdByName: `${task.createdBy.personNode.firstName} ${task.createdBy.personNode.lastName}`,
      }))}
      initialBalances={members.map((m) => ({
        memberId: m.id,
        name: `${m.personNode.firstName} ${m.personNode.lastName}`,
        balance: balanceByMember.get(m.id) ?? 0,
      }))}
      initialRewards={rewards.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        pointCost: r.pointCost,
        stock: r.stock,
      }))}
    />
  );
}
