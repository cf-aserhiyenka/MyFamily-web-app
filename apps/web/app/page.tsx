import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@myfamily/db";
import { DashboardClient } from "./DashboardClient";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // Logged-out visitor: keep the simple public landing, no DB queries needed.
  if (!session?.user?.id) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-4xl">MyFamily</h1>
        <p>Private space for your family.</p>
        <div className="flex gap-4">
          <Link href="/login">Log in</Link>
          <Link href="/register">Sign up</Link>
        </div>
      </main>
    );
  }

  // Same pattern as /profile: server component fetches data, client component renders it.
  const [personNode, familyMembers] = await Promise.all([
    prisma.personNode.findUnique({ where: { userId: session.user.id } }),
    prisma.familyMember.findMany({
      where: { userId: session.user.id },
      include: { family: { include: { _count: { select: { members: true } } } } },
    }),
  ]);

  return (
    <DashboardClient
      firstName={personNode?.firstName ?? ""}
      families={familyMembers.map((member) => ({
        id: member.family.id,
        name: member.family.name,
        memberCount: member.family._count.members,
      }))}
    />
  );
}
