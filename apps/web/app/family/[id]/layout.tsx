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
    select: { name: true },
  });

    return(
        <div  className="flex min-h-screen">
            <Sidebar familyId={familyId} familyName={family?.name ?? ""} />
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}
