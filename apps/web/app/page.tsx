import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@myfamily/db";
import { DashboardClient2 } from "./DashboardClient";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-5">
        <h1 className="text-6xl">MyFamily</h1>
        <p>Private space for your family.</p>
        <div className="flex gap-8">
          <Link href="/login">Log in</Link>
          <Link href="/register">Sign up</Link>
        </div>
      </main>
    );
  }

  const personNode = await prisma.personNode.findUnique({
    where: { userId: session.user.id },
  });

  const familyMembers = await prisma.familyMember.findMany({
    where: { userId: session.user.id },
    include: { family: true },
  });

  return (
    <DashboardClient2
      firstName={personNode ? personNode.firstName : ""}
      families={familyMembers.map((member) => ({
        id: member.family.id,
        name: member.family.name,
        avatarBase64: member.family.avatarBase64,
      }))}
    />
  );
}
