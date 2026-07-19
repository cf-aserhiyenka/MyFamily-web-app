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
  });

  return (
    <ChatClient
      memberId={member.id}
      conversations={conversations.map((conversation) => ({
        id: conversation.id,
        type: conversation.type,
        name: conversation.name,
      }))}
    />
  );
}
