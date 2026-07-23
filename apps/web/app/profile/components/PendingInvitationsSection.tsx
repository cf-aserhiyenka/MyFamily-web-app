"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type PendingInvitationRow = {
  id: string;
  familyName: string;
  role: string;
  invitedByName: string;
};

type PendingInvitationsSectionProps = {
  pendingInvitations: PendingInvitationRow[];
};

export function PendingInvitationsSection(props: PendingInvitationsSectionProps) {
  const  pendingInvitations = props.pendingInvitations;
  const router = useRouter();
  const [invitationActionError, setInvitationActionError] = useState("");

  async function onAcceptInvitation(invitationId: string) {
    setInvitationActionError("");
    const response = await fetch(`/api/invitations/${invitationId}/accept`, { method: "POST" });

    if (!response.ok) {
      const body = await response.json();
      setInvitationActionError(body.error ?? "Could not accept invitation.");
      return;
    }

    router.refresh();
  }

  async function onDeclineInvitation(invitationId: string) {
    setInvitationActionError("");
    const response = await fetch(`/api/invitations/${invitationId}/decline`, { method: "POST" });

    if (!response.ok) {
      const body = await response.json();
      setInvitationActionError(body.error ?? "Could not decline invitation.");
      return;
    }

    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-bark p-6 shadow-sm flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Pending Invitations</h2>
        <p className="text-xs">Other families invited you to join them.</p>
      </div>
      {invitationActionError && <p className="text-xs">{invitationActionError}</p>}
      {pendingInvitations.length === 0 ? (
        <p className="text-xs">No pending invitations.</p>
      ) : (
        pendingInvitations.map((invitation) => (
            <div
              key={invitation.id}
              className="p-4 border border-bark rounded-xl flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-bark text-cream flex items-center justify-center font-bold text-sm">
                  {invitation.familyName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold">{invitation.familyName}</p>
                  <p className="text-xs">
                    Invited you as <span className="font-semibold">{invitation.role}</span>
                  </p>
                  <p className="text-xs">
                    By <span className="font-semibold">{invitation.invitedByName}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => onAcceptInvitation(invitation.id)}
                  className="w-full bg-bark text-cream text-xs font-semibold py-2 rounded-lg transition"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => onDeclineInvitation(invitation.id)}
                  className="w-full border border-bark text-xs font-semibold py-2 rounded-lg transition"
                >
                  Decline
                </button>
              </div>
            </div>
          ))
      )}
    </section>
  );
}
