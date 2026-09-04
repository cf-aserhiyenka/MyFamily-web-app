import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, MemberStatus, FamilyRole } from "@myfamily/db";
import { updateTaskSchema } from "@myfamily/shared";

async function requireTaskAccess(familyId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false as const, response: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
  }

  const membership = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: session.user.id, familyId } },
  });

  if (!membership || membership.status !== MemberStatus.ACTIVE) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "You are not a member of this family" }, { status: 403 }),
    };
  }
  if (membership.role !== FamilyRole.PARENT && membership.role !== FamilyRole.GUARDIAN) {
    return { ok: false as const, response: NextResponse.json({ error: "Not permitted" }, { status: 403 }) };
  }

  return { ok: true as const, membership };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const { id: familyId, taskId } = await params;

  const access = await requireTaskAccess(familyId);
  if (!access.ok) return access.response;

  const body = await request.json();
  const parsed = updateTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid task data" }, { status: 400 });
  }

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task || task.familyId !== familyId) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  if (parsed.data.assigneeId) {
    const assignee = await prisma.familyMember.findUnique({
      where: { id: parsed.data.assigneeId },
    });
    if (!assignee || assignee.familyId !== familyId) {
      return NextResponse.json({ error: "Invalid assignee" }, { status: 400 });
    }
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: parsed.data,
  });

  return NextResponse.json({ id: updated.id });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const { id: familyId, taskId } = await params;

  const access = await requireTaskAccess(familyId);
  if (!access.ok) return access.response;

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task || task.familyId !== familyId) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  await prisma.task.delete({ where: { id: taskId } });

  return NextResponse.json({ ok: true });
}
