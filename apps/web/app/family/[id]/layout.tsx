import { notFound } from "next/navigation";
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

  const family = await prisma.family.findUnique({
    where: { id: familyId },
    select: { name: true, isActive: true },
  });

  if (!family || !family.isActive) {
    notFound();
  }

    return(
        <div  className="flex h-screen overflow-hidden">
            <Sidebar familyId={familyId} familyName={family?.name ?? ""} />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
