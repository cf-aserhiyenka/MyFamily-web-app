import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@myfamily/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: conversationId } = await params;

  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const member = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: session.user.id, familyId: conversation.familyId } },
  });
  if (!member) {
    return NextResponse.json({ error: "Not a member of this family" }, { status: 403 });
  }

  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_memberId: { conversationId, memberId: member.id } },
  });
  if (!participant || participant.leftAt) {
    return NextResponse.json({ error: "Not a participant of this conversation" }, { status: 403 });
  }

  await prisma.conversationParticipant.update({
    where: { conversationId_memberId: { conversationId, memberId: member.id } },
    data: { leftAt: new Date() },
  });

  const remaining = await prisma.conversationParticipant.count({
    where: { conversationId, leftAt: null },
  });
// maybe delete in postgress as procidure or trigger
  // if (remaining === 0) {
  //   await prisma.$transaction([
  //     prisma.message.deleteMany({ where: { conversationId } }),
  //     prisma.conversationParticipant.deleteMany({ where: { conversationId } }),
  //     prisma.conversation.delete({ where: { id: conversationId } }),
  //   ]);
  // }

  return NextResponse.json({ ok: true });
}
