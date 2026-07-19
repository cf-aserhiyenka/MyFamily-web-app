import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@myfamily/db";
import { sendMessageSchema } from "@myfamily/shared";

async function getActiveParticipant(userId: string, conversationId: string) {
  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation) return null;

  const member = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId, familyId: conversation.familyId } },
  });
  if (!member) return null;

  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_memberId: { conversationId, memberId: member.id } },
  });
  if (!participant || participant.leftAt) return null;

  return member;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: conversationId } = await params;

  const member = await getActiveParticipant(session.user.id, conversationId);
  if (!member) {
    return NextResponse.json({ error: "Not a participant of this conversation" }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId, isDeleted: false },
    orderBy: { sentAt: "asc" },
    include: { sender: { include: { personNode: true } } },
  });

  return NextResponse.json({
    messages: messages.map((message) => ({
      id: message.id,
      content: message.content,
      sentAt: message.sentAt,
      senderId: message.senderId,
      senderName: `${message.sender.personNode.firstName} ${message.sender.personNode.lastName}`,
    })),
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: conversationId } = await params;

  const body = await request.json();
  const parsed = sendMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  const member = await getActiveParticipant(session.user.id, conversationId);
  if (!member) {
    return NextResponse.json({ error: "Not a participant of this conversation" }, { status: 403 });
  }

  const message = await prisma.message.create({
    data: {
      content: parsed.data.content,
      conversationId,
      senderId: member.id,
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: message.sentAt },
  });

  return NextResponse.json({ id: message.id }, { status: 201 });
}
