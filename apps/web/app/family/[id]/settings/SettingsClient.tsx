"use client";

import { FamilyInfoSection } from "./components/FamilyInfoSection";
import { MembersSection, type MemberRow } from "./components/MembersSection";
import { InvitationsSection, type InvitationRow } from "./components/InvitationsSection";
import { AdvancedSettingsSection } from "./components/AdvancedSettingsSection";

type SettingsClientProps = {
  familyId: string;
  family: {
    name: string;
    description: string;
    avatarBase64: string | null;
  };
  canManageFamily: boolean;
  canDeleteFamily: boolean;
  currentUserId: string;
  members: MemberRow[];
  invitations: InvitationRow[];
};

export function SettingsClient({
  familyId,
  family,
  canManageFamily,
  canDeleteFamily,
  currentUserId,
  members,
  invitations,
}: SettingsClientProps) {
  return (
    <div className="min-h-screen flex flex-col gap-6 p-4 md:p-8 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold">Family Settings</h1>
        <p className="text-sm mt-1">Manage {family.name} and members.</p>
      </div>

      <FamilyInfoSection familyId={familyId} family={family} canManageFamily={canManageFamily} />

      <MembersSection
        familyId={familyId}
        members={members}
        canManageFamily={canManageFamily}
        currentUserId={currentUserId}
      />

      {canManageFamily && <InvitationsSection familyId={familyId} invitations={invitations} />}

      {canManageFamily && (
        <AdvancedSettingsSection familyId={familyId} familyName={family.name} canDeleteFamily={canDeleteFamily} />
      )}
    </div>
  );
}
