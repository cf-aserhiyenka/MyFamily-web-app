import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, MemberStatus, FamilyRole, TaskStatus } from "@myfamily/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: familyId, taskId } = await params;

  const membership = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: session.user.id, familyId } },
  });

  if (!membership || membership.status !== MemberStatus.ACTIVE) {
    return NextResponse.json({ error: "You are not a member of this family" }, { status: 403 });
  }
  if (membership.role !== FamilyRole.PARENT && membership.role !== FamilyRole.GUARDIAN) {
    return NextResponse.json({ error: "Not permitted" }, { status: 403 });
  }

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task || task.familyId !== familyId) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  if (task.status !== TaskStatus.PROPOSED) {
    return NextResponse.json({ error: "Task is not waiting for acceptance" }, { status: 400 });
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { status: TaskStatus.TODO },
  });

  return NextResponse.json({ id: updated.id, status: updated.status });
}
