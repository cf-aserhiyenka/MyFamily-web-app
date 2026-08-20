import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFamilyPermissions } from "@/lib/permissions";
import { getFamilyTreeData, buildGenerations } from "@/lib/tree";
import { TreeClient } from "./TreeClient";

export default async function TreePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: familyId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const permissions = await getFamilyPermissions(session.user.id, familyId);

  if (!permissions?.isActiveMember) {
    notFound();
  }

  const { persons, relations } = await getFamilyTreeData(familyId);
  const generations = buildGenerations(persons, relations);

  return (
    <TreeClient
      familyId={familyId}
      currentUserId={session.user.id}
      persons={persons}
      relations={relations}
      generations={generations}
    />
  );
}
