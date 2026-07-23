"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createFamilySchema,
  type CreateFamilyInput,
  createInvitationSchema,
  type CreateInvitationInput,
} from "@myfamily/shared";

export type FamilyRow = {
  id: string;
  name: string;
  role: string;
  isOwner: boolean;
};

type FamiliesSectionProps = {
  families: FamilyRow[];
  canCreateFamily: boolean;
  createFamilyBlockedReason: string;
};

export function FamiliesSection({
  families,
  canCreateFamily,
  createFamilyBlockedReason,
}: FamiliesSectionProps) {
  const router = useRouter();

  const [showCreateFamilyForm, setShowCreateFamilyForm] = useState(false);
  const [createFamilyGateMessage, setCreateFamilyGateMessage] = useState("");
  const [createFamilyError, setCreateFamilyError] = useState("");
  const {
    register: registerFamily,
    handleSubmit: handleFamilySubmit,
    reset: resetFamilyForm,
    formState: { errors: familyErrors, isSubmitting: isSubmittingFamily },
  } = useForm<CreateFamilyInput>({
    resolver: zodResolver(createFamilySchema),
  });

  function onCreateFamilyClick() {
    if (!canCreateFamily) {
      setCreateFamilyGateMessage(createFamilyBlockedReason);
      return;
    }
    setCreateFamilyGateMessage("");
    setShowCreateFamilyForm(true);
  }

  async function onCreateFamilySubmit(data: CreateFamilyInput) {
    setCreateFamilyError("");

    const response = await fetch("/api/family", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const body = await response.json();
      setCreateFamilyError(body.error ?? "Could not create family.");
      return;
    }

    resetFamilyForm();
    setShowCreateFamilyForm(false);
    router.refresh();
  }

  const [manageFamilyId, setManageFamilyId] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const {
    register: registerInvite,
    handleSubmit: handleInviteSubmit,
    reset: resetInviteForm,
    formState: { errors: inviteErrors, isSubmitting: isSubmittingInvite },
  } = useForm<CreateInvitationInput>({
    resolver: zodResolver(createInvitationSchema),
  });

  function onManageClick(familyId: string) {
    setInviteError("");
    setInviteSuccess(false);
    resetInviteForm();
    setManageFamilyId((current) => (current === familyId ? null : familyId));
  }

  async function onInviteSubmit(data: CreateInvitationInput) {
    if (!manageFamilyId) return;
    setInviteError("");
    setInviteSuccess(false);

    const response = await fetch(`/api/family/${manageFamilyId}/invitations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const body = await response.json();
      setInviteError(body.error ?? "Could not send invitation.");
      return;
    }

    resetInviteForm();
    setInviteSuccess(true);
  }

  return (
    <section className="rounded-2xl border border-bark p-6 shadow-sm flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">My Families</h2>
        <p className="text-xs">Families you are currently a member of.</p>
      </div>

      <ul className="flex flex-col gap-3">
        {families.map((family) => (
          <li key={family.id} className="rounded-xl border border-bark">
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-bark text-cream flex items-center justify-center font-bold text-sm">
                  {family.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold">{family.name}</p>
                  <span className="inline-block bg-bark text-cream text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5">
                    {family.isOwner ? "Owner" : family.role}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onManageClick(family.id)}
                className="text-xs border border-bark font-medium px-3 py-1.5 rounded-lg transition"
              >
                Manage
              </button>
            </div>

            {manageFamilyId === family.id && (
              <form
                className="flex flex-col gap-2 p-3 border-t border-bark"
                onSubmit={handleInviteSubmit(onInviteSubmit)}
              >
                <p className="text-xs font-medium">Invite someone to {family.name}</p>
                <input
                  type="email"
                  placeholder="Email address"
                  className="rounded-lg border border-bark p-2 text-sm focus:outline-none transition"
                  {...registerInvite("email")}
                />
                {inviteErrors.email && (
                  <span className="text-xs">{inviteErrors.email.message}</span>
                )}

                <select
                  className="rounded-lg border border-bark p-2 text-sm focus:outline-none transition"
                  {...registerInvite("role")}
                >
                  <option value="PARENT">Parent</option>
                  <option value="CHILD">Child</option>
                  <option value="GUARDIAN">Guardian</option>
                  <option value="SENIOR">Senior</option>
                </select>
                {inviteErrors.role && (
                  <span className="text-xs">{inviteErrors.role.message}</span>
                )}

                {inviteError && <span className="text-xs">{inviteError}</span>}
                {inviteSuccess && <span className="text-xs">Invitation sent.</span>}

                <button
                  type="submit"
                  disabled={isSubmittingInvite}
                  className="self-start bg-bark text-cream font-medium text-xs px-3 py-2 rounded-lg shadow-sm transition"
                >
                  {isSubmittingInvite ? "Sending..." : "Send invitation"}
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>

      {createFamilyGateMessage && (
        <p className="text-xs">{createFamilyGateMessage}</p>
      )}

      {showCreateFamilyForm ? (
        <form
          className="flex flex-col gap-2"
          onSubmit={handleFamilySubmit(onCreateFamilySubmit)}
        >
          <input
            type="text"
            placeholder="Family name"
            className="rounded-lg border border-bark p-2.5 text-sm focus:outline-none transition"
            {...registerFamily("name")}
          />
          {familyErrors.name && (
            <span className="text-xs">{familyErrors.name.message}</span>
          )}
          {createFamilyError && <span className="text-xs">{createFamilyError}</span>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmittingFamily}
              className="flex-1 bg-bark text-cream font-medium text-sm px-3 py-2 rounded-lg shadow-sm transition"
            >
              {isSubmittingFamily ? "Creating..." : "Create"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateFamilyForm(false)}
              className="flex-1 border border-bark text-sm font-medium px-3 py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={onCreateFamilyClick}
          className="w-full mt-2 py-2.5 border border-dashed border-bark rounded-lg text-sm font-medium transition"
        >
          + Create new family
        </button>
      )}
    </section>
  );
}
