import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFamilyPermissions } from "@/lib/permissions";
import { prisma, MemberStatus } from "@myfamily/db";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: familyId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const permissions = await getFamilyPermissions(session.user.id, familyId);

  if (!permissions?.isActiveMember) {
    notFound();
  }

  const family = await prisma.family.findUnique({ where: { id: familyId } });

  if (!family || !family.isActive) {
    notFound();
  }

  const [members, invitations] = await Promise.all([
    prisma.familyMember.findMany({
      where: { familyId, status: MemberStatus.ACTIVE },
      include: { personNode: true, user: { select: { email: true } } },
      orderBy: { joinedAt: "asc" },
    }),
    prisma.familyInvitation.findMany({
      where: {
        familyId,
        usedAt: null,
        declinedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <SettingsClient
      familyId={familyId}
      family={{
        name: family.name,
        description: family.description ?? "",
        avatarBase64: family.avatarBase64,
      }}
      canManageFamily={permissions.canManageFamily}
      canDeleteFamily={permissions.canDeleteFamily}
      currentUserId={session.user.id}
      members={members.map((member) => ({
        id: member.id,
        userId: member.userId,
        name: `${member.personNode.firstName} ${member.personNode.lastName}`,
        email: member.user.email,
        role: member.role,
        isOwner: member.userId === family.createdById,
      }))}
      invitations={invitations.map((invitation) => ({
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt.toISOString(),
      }))}
    />
  );
}
