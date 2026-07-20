import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@myfamily/db";
import { ChatClient } from "./ChatClient";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: familyId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const member = await prisma.familyMember.findUnique({
    where: {
      userId_familyId: { userId: session.user.id, familyId },
    },
  });

  if (!member || member.status !== "ACTIVE") {
    notFound();
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      familyId,
      participants: {
        some: { memberId: member.id, leftAt: null },
      },
    },
    orderBy: { lastMessageAt: "desc" },
    include: {
      participants: {
        where: { memberId: { not: member.id } },
        include: { member: { include: { personNode: true } } },
      },
    },
  });

  const members = await prisma.familyMember.findMany({
    where: { familyId, status: "ACTIVE", id: { not: member.id } },
    include: { personNode: true },
  });

  return (
    <ChatClient
      familyId={familyId}
      memberId={member.id}
      conversations={conversations.map((conversation) => {
        const other = conversation.participants[0]?.member.personNode;
        return {
          id: conversation.id,
          type: conversation.type,
          name:
            conversation.type === "DIRECT" && other
              ? `${other.firstName} ${other.lastName}`
              : conversation.name,
        };
      })}
      members={members.map((m) => ({
        id: m.id,
        name: `${m.personNode.firstName} ${m.personNode.lastName}`,
      }))}
    />
  );
}
