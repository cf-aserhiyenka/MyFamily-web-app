import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, MemberStatus } from "@myfamily/db";
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

  if (!member || member.status !== MemberStatus.ACTIVE) {
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
    where: { familyId, status: MemberStatus.ACTIVE, id: { not: member.id } },
    include: { personNode: true },
  });

  return (
    <ChatClient
      familyId={familyId}
      memberId={member.id}
      conversations={conversations.map((con) => {
        const others = con.participants.map((p) => p.member.personNode);
        const other = others[0];
        let name;

        if (con.type === "DIRECT" && other) {
          name = `${other.firstName} ${other.lastName}`;
        } else {
          name = con.name;
        }

        return {
          id: con.id,
          type: con.type,
          name: name,
          participantNames: others.map((p) => `${p.firstName} ${p.lastName}`),
        };
      })}
      members={members.map((m) => ({
        id: m.id,
        name: `${m.personNode.firstName} ${m.personNode.lastName}`,
      }))}
    />
  );
}
