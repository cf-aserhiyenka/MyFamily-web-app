"use client";

import Link from "next/link";
import { PersonalInfoForm } from "./components/PersonalInfoForm";
import { FamiliesSection, type FamilyRow } from "./components/FamiliesSection";
import {PendingInvitationsSection,type PendingInvitationRow} from "./components/PendingInvitationsSection";

type ProfileClientProps = {
  email: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  avatarBase64: string | null;
  canCreateFamily: boolean;
  createFamilyBlockedReason: string;
  families: FamilyRow[];
  pendingInvitations: PendingInvitationRow[];
};

export function ProfileClient({
  email,
  firstName,
  lastName,
  birthDate,
  avatarBase64,
  canCreateFamily,
  createFamilyBlockedReason,
  families,
  pendingInvitations,
}: ProfileClientProps) {
  return (
    <main className="min-h-screen p-4 md:p-12">
      <div className="max-w-6xl mx-auto mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm hover:underline transition mb-3"
        >
          <span>←</span> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-sm">Manage your personal information and family memberships.</p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <PersonalInfoForm
          email={email}
          firstName={firstName}
          lastName={lastName}
          birthDate={birthDate}
          avatarBase64={avatarBase64}
        />

        <div className="flex flex-col gap-6">
          <FamiliesSection
            families={families}
            canCreateFamily={canCreateFamily}
            createFamilyBlockedReason={createFamilyBlockedReason}
          />
          <PendingInvitationsSection pendingInvitations={pendingInvitations} />
        </div>
      </div>
    </main>
  );
}
