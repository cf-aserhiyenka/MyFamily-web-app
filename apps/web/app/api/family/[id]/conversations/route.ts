import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@myfamily/db";

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

  const currentMember = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: session.user.id, familyId } },
  });
  if (!currentMember || currentMember.status !== "ACTIVE") {
    return NextResponse.json({ error: "Not a member of this family" }, { status: 403 });
  }

  const targetMember = await prisma.familyMember.findUnique({
    where: { id: body.targetMemberId },
  });
  if (
    !targetMember ||
    targetMember.familyId !== familyId ||
    targetMember.status !== "ACTIVE" ||
    targetMember.id === currentMember.id
  ) {
    return NextResponse.json({ error: "Invalid target member" }, { status: 400 });
  }

  const existing = await prisma.conversation.findFirst({
    where: {
      familyId,
      type: "DIRECT",
      AND: [
        { participants: { some: { memberId: currentMember.id, leftAt: null } } },
        { participants: { some: { memberId: targetMember.id, leftAt: null } } },
      ],
    },
  });

  if (existing) {
    return NextResponse.json({ id: existing.id }, { status: 200 });
  }

  const conversation = await prisma.conversation.create({
    data: {
      type: "DIRECT",
      familyId,
      createdById: currentMember.id,
      participants: {
        create: [{ memberId: currentMember.id }, { memberId: targetMember.id }],
      },
    },
  });

  return NextResponse.json({ id: conversation.id }, { status: 201 });
}
