import { prisma, MemberStatus, FamilyRole } from "@myfamily/db";

export type FamilyPermissions = {
  isOwner: boolean;
  isActiveMember: boolean;
  canManageFamily: boolean;
  canDeleteFamily: boolean;
};

export async function getFamilyPermissions(
  userId: string,
  familyId: string
): Promise<FamilyPermissions | null> {
  const family = await prisma.family.findUnique({
    where: { id: familyId },
    select: { createdById: true },
  });

  if (!family) {
    return null;
  }

  const membership = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId, familyId } },
  });

  const isOwner = family.createdById === userId;
  const isActiveMember = membership?.status === MemberStatus.ACTIVE;
  const canManageFamily = isActiveMember && (isOwner || membership?.role === FamilyRole.PARENT);

  return {
    isOwner,
    isActiveMember,
    canManageFamily,
    canDeleteFamily: isOwner,
  };
}

export function canEditPersonNode(userId: string, personNode: { createdById: string }): boolean {
  return personNode.createdById === userId;
}
