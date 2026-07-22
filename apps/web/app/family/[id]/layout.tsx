import { Sidebar } from "./Sidebar";

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
//  const family = await params;

  console.log(familyId);

    return(
        <div  className="flex min-h-screen">
            <Sidebar familyId= {familyId} />
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}
