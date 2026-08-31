import { prisma, MemberStatus, FamilyRole, type FamilyMember } from "@myfamily/db";

//  RBAC.
export const ROLE_PERMISSIONS: Record<
  FamilyRole,
  { manageFamily: boolean; manageFinance: boolean; manageTree: boolean; manageArchive: boolean; chat: boolean }
> = {
  PARENT: { manageFamily: true, manageFinance: true, manageTree: true, manageArchive: true, chat: true },
  GUARDIAN: { manageFamily: true, manageFinance: true, manageTree: true, manageArchive: true, chat: true },
  CHILD: { manageFamily: false, manageFinance: false, manageTree: false, manageArchive: false, chat: true },
  SENIOR: { manageFamily: false, manageFinance: false, manageTree: false, manageArchive: false, chat: true },
};

export type FamilyContext = {
  ownerId: string;
  membership: FamilyMember | null;
  isOwner: boolean;
  isActiveMember: boolean;
  permissions: (typeof ROLE_PERMISSIONS)[FamilyRole] | null;
  canManageFamily: boolean;
  canDeleteFamily: boolean;
};

export async function getFamilyContext(
  userId: string,
  familyId: string
): Promise<FamilyContext | null> {
  const [family, membership] = await Promise.all([
    prisma.family.findUnique({ where: { id: familyId }, select: { createdById: true } }),
    prisma.familyMember.findUnique({ where: { userId_familyId: { userId, familyId } } }),
  ]);

  if (!family) {
    return null;
  }

  const isOwner = family.createdById === userId;
  const isActiveMember = membership?.status === MemberStatus.ACTIVE;
  const permissions = membership ? ROLE_PERMISSIONS[membership.role] : null;

  return {
    ownerId: family.createdById,
    membership,
    isOwner,
    isActiveMember,
    permissions,
    canManageFamily: isActiveMember && (isOwner || permissions?.manageFamily === true),
    canDeleteFamily: isOwner,
  };
}

export function canEditPersonNode(userId: string, personNode: { createdById: string }): boolean {
  return personNode.createdById === userId;
}
