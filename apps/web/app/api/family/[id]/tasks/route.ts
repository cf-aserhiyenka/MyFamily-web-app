import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@myfamily/db";
import { createTaskSchema } from "@myfamily/shared";
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

  const tasks = await prisma.task.findMany({
    where: { familyId },
    orderBy: { createdAt: "desc" },
    include: {
      assignee: { include: { personNode: true } },
      createdBy: { include: { personNode: true } },
    },
  });

  return NextResponse.json(
    {
      tasks: tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        points: task.points,
        dueDate: task.dueDate,
        assigneeId: task.assigneeId,
        assigneeName: task.assignee
          ? `${task.assignee.personNode.firstName} ${task.assignee.personNode.lastName}`
          : null,
        createdByName: `${task.createdBy.personNode.firstName} ${task.createdBy.personNode.lastName}`,
      })),
    },
    { status: 200 }
  );
}

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
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid task data" }, { status: 400 });
  }

  const context = await getFamilyContext(session.user.id, familyId);

  if (!context?.isActiveMember || !context.membership) {
    return NextResponse.json({ error: "You are not a member of this family" }, { status: 403 });
  }

  if (parsed.data.assigneeId) {
    const assignee = await prisma.familyMember.findUnique({
      where: { id: parsed.data.assigneeId },
    });
    if (!assignee || assignee.familyId !== familyId) {
      return NextResponse.json({ error: "Invalid assignee" }, { status: 400 });
    }
  }

  const status = context.permissions?.manageTasks ? "TODO" : "PROPOSED";

  const task = await prisma.task.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      status,
      priority: parsed.data.priority,
      points: parsed.data.points,
      dueDate: parsed.data.dueDate,
      assigneeId: parsed.data.assigneeId ?? null,
      familyId,
      createdById: context.membership.id,
    },
  });

  return NextResponse.json({ id: task.id }, { status: 201 });
}
