import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "./Sidebar";
import { prisma } from "@myfamily/db";

export default async function FamilyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{
    id: string;
  }>;
}) {
  const familyId  = (await params).id;
  const session = await getServerSession(authOptions);

  const family = await prisma.family.findUnique({
    where: { id: familyId },
    select: { name: true, isActive: true },
  });

  if (!family || !family.isActive) {
    notFound();
  }

  const personNode = session?.user?.id
    ? await prisma.personNode.findUnique({ where: { userId: session.user.id } })
    : null;

  const userName = personNode
    ? `${personNode.firstName} ${personNode.lastName}`
    : "";

    return(
        <div  className="flex h-screen overflow-hidden">
            <Sidebar familyId={familyId} familyName={family?.name ?? ""} userName={userName} />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
