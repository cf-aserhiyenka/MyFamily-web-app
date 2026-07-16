import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@myfamily/db";
import { ProfileClient } from "./ProfileClient";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [user, personNode, familyMembers, pendingInvitations] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.personNode.findUnique({ where: { userId: session.user.id } }),
    prisma.familyMember.findMany({
      where: { userId: session.user.id },
      include: { family: true },
    }),
    prisma.familyInvitation.findMany({
      where: {
        email: session.user.email ?? "",
        usedAt: null,
        declinedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { family: true, invitedBy: { include: { personNode: true } } },
    }),
  ]);

  if (!user) {
    redirect("/login");
  }

  const profileComplete = Boolean(
    personNode?.firstName && personNode?.lastName && personNode?.birthDate
  );

  return (
    <ProfileClient
      email={user.email}
      firstName={personNode?.firstName ?? ""}
      lastName={personNode?.lastName ?? ""}
      birthDate={personNode?.birthDate?.toISOString().split("T")[0] ?? ""}
      avatarBase64={personNode?.avatarBase64 ?? null}
      profileComplete={profileComplete}
      families={familyMembers.map((member) => ({
        id: member.family.id,
        name: member.family.name,
        role: member.role,
        isOwner: member.family.createdById === session.user.id,
      }))}
      pendingInvitations={pendingInvitations.map((invitation) => ({
        id: invitation.id,
        familyName: invitation.family.name,
        role: invitation.role,
        invitedByName: `${invitation.invitedBy.personNode.firstName} ${invitation.invitedBy.personNode.lastName}`,
      }))}
    />
  );
}
