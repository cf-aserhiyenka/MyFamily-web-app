import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@myfamily/db";
import { getViewUrl } from "@/lib/s3";

export default async function DashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: familyId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const member = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: session.user.id, familyId } },
  });

  if (!member || member.status !== "ACTIVE") {
    notFound();
  }

  const [personNode, family] = await Promise.all([
    prisma.personNode.findUnique({ where: { userId: session.user.id } }),
    prisma.family.findUnique({ where: { id: familyId }, select: { name: true } }),
  ]);

  const participants = await prisma.conversationParticipant.findMany({
    where: { memberId: member.id, leftAt: null },
    include: { conversation: true },
  });

  const unreadByConversation = await Promise.all(
    participants.map(async (p) => {
      const count = await prisma.message.count({
        where: {
          conversationId: p.conversationId,
          senderId: { not: member.id },
          isDeleted: false,
          sentAt: { gt: p.lastReadAt ?? p.joinedAt },
        },
      });
      return { name: p.conversation.name ?? "Conversation", count };
    })
  );

  const totalUnread = unreadByConversation.reduce((sum, c) => sum + c.count, 0);

  const [randomPhoto] = await prisma.$queryRaw<{ storageKey: string; originalName: string }[]>`
    SELECT "storageKey", "originalName"
    FROM "MediaFile"
    WHERE "familyId" = ${familyId}
    ORDER BY RANDOM()
    LIMIT 1
  `;

  const randomPhotoUrl = randomPhoto ? await getViewUrl(randomPhoto.storageKey) : null;

  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back{personNode?.firstName ? `, ${personNode.firstName}` : ""}! Here&apos;s what&apos;s new in {family?.name ?? "your family"}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="rounded-2xl border border-bark p-4 shadow-sm">
          <h2 className="font-semibold mb-2">Unread messages</h2>
          <p className="text-sm">{totalUnread} unread</p>
          <ul className="text-sm flex flex-col gap-1 mt-2">
            {unreadByConversation
              .filter((c) => c.count > 0)
              .map((c, i) => (
                <li key={i}>
                  {c.name}: {c.count}
                </li>
              ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-bark p-4 shadow-sm">
          <h2 className="font-semibold mb-2">Random photo</h2>
          {randomPhotoUrl ? (
            <img
              src={randomPhotoUrl}
              alt={randomPhoto.originalName}
              className="w-full h-40 object-cover rounded"
            />
          ) : (
            <p className="text-sm">No photos yet</p>
          )}
        </section>
      </div>
    </main>
  );
}
