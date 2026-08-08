import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@myfamily/db";
import { sendMessageSchema } from "@myfamily/shared";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: conversationId, messageId } = await params;

  const body = await request.json();
  const parsed = sendMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message || message.conversationId !== conversationId || message.isDeleted) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  const member = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: session.user.id, familyId: conversation.familyId } },
  });
  if (!member || member.id !== message.senderId) {
    return NextResponse.json({ error: "Not allowed to edit this message" }, { status: 403 });
  }

  const lastMessage = await prisma.message.findFirst({
    where: { conversationId, isDeleted: false },
    orderBy: { sentAt: "desc" },
  });
  if (lastMessage?.id !== messageId) {
    return NextResponse.json({ error: "Only the last message can be edited" }, { status: 403 });
  }

  const updated = await prisma.message.update({
    where: { id: messageId },
    data: { content: parsed.data.content, editedAt: new Date() },
  });

  return NextResponse.json({ id: updated.id, content: updated.content, editedAt: updated.editedAt });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: conversationId, messageId } = await params;

  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message || message.conversationId !== conversationId || message.isDeleted) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  const member = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: session.user.id, familyId: conversation.familyId } },
  });
  if (!member || member.id !== message.senderId) {
    return NextResponse.json({ error: "Not allowed to delete this message" }, { status: 403 });
  }

  await prisma.message.update({
    where: { id: messageId },
    data: { isDeleted: true, deletedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
