"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type InvitationRow = {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
};

type InvitationsSectionProps = {
  familyId: string;
  invitations: InvitationRow[];
};

export function InvitationsSection({ familyId, invitations }: InvitationsSectionProps) {
  const router = useRouter();
  const [actionError, setActionError] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function onCancel(invitationId: string) {
    setActionError("");
    setPendingId(invitationId);

    const response = await fetch(`/api/family/${familyId}/invitations/${invitationId}`, {
      method: "DELETE",
    });

    setPendingId(null);

    if (!response.ok) {
      const body = await response.json();
      setActionError(body.error ?? "Could not cancel invitation.");
      return;
    }

    router.refresh();
  }

  async function onResend(invitation: InvitationRow) {
    setActionError("");
    setPendingId(invitation.id);

    const cancelResponse = await fetch(`/api/family/${familyId}/invitations/${invitation.id}`, {
      method: "DELETE",
    });

    if (!cancelResponse.ok) {
      setPendingId(null);
      const body = await cancelResponse.json();
      setActionError(body.error ?? "Could not resend invitation.");
      return;
    }

    const resendResponse = await fetch(`/api/family/${familyId}/invitations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: invitation.email, role: invitation.role }),
    });

    setPendingId(null);

    if (!resendResponse.ok) {
      const body = await resendResponse.json();
      setActionError(body.error ?? "Could not resend invitation.");
      return;
    }

    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-bark p-6 shadow-sm flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Pending Invitations</h2>
        <p className="text-xs">Invitations sent to join this family that haven't been answered yet.</p>
      </div>

      {actionError && <p className="text-xs">{actionError}</p>}

      {invitations.length === 0 ? (
        <p className="text-xs">No pending invitations.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {invitations.map((invitation) => {
            const isPending = pendingId === invitation.id;
            return (
              <li
                key={invitation.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-bark"
              >
                <div>
                  <p className="text-sm font-semibold">{invitation.email}</p>
                  <p className="text-xs">
                    Invited as <span className="font-semibold">{invitation.role}</span> · expires{" "}
                    {new Date(invitation.expiresAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => onResend(invitation)}
                    className="text-xs border border-bark font-medium px-3 py-1.5 rounded-lg transition"
                  >
                    Resend
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => onCancel(invitation.id)}
                    className="text-xs border border-bark font-medium px-3 py-1.5 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
