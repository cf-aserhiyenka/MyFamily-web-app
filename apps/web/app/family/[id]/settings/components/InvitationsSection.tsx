"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createInvitationSchema, type CreateInvitationInput } from "@myfamily/shared";

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

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const {
    register: registerInvite,
    handleSubmit: handleInviteSubmit,
    reset: resetInviteForm,
    formState: { errors: inviteErrors, isSubmitting: isSubmittingInvite },
  } = useForm<CreateInvitationInput>({
    resolver: zodResolver(createInvitationSchema),
  });

  async function onInviteSubmit(data: CreateInvitationInput) {
    setInviteError("");

    const response = await fetch(`/api/family/${familyId}/invitations`, {
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
    setShowInviteForm(false);
    router.refresh();
  }

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Invitations</h2>
          <p className="text-xs">Invite new members and manage invitations that haven&apos;t been answered yet.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowInviteForm((shown) => !shown)}
          className="text-xs border border-bark font-medium px-3 py-1.5 rounded-lg transition"
        >
          Invite member
        </button>
      </div>

      {showInviteForm && (
        <form className="flex flex-col gap-2 p-3 rounded-xl border border-bark" onSubmit={handleInviteSubmit(onInviteSubmit)}>
          <input
            type="email"
            placeholder="Email address"
            className="rounded-lg border border-bark p-2 text-sm focus:outline-none transition"
            {...registerInvite("email")}
          />
          {inviteErrors.email && <span className="text-xs">{inviteErrors.email.message}</span>}

          <select
            className="rounded-lg border border-bark p-2 text-sm focus:outline-none transition"
            {...registerInvite("role")}
          >
            <option value="PARENT">Parent</option>
            <option value="CHILD">Child</option>
            <option value="GUARDIAN">Guardian</option>
            <option value="SENIOR">Senior</option>
          </select>
          {inviteErrors.role && <span className="text-xs">{inviteErrors.role.message}</span>}

          {inviteError && <span className="text-xs">{inviteError}</span>}

          <button
            type="submit"
            disabled={isSubmittingInvite}
            className="self-start bg-bark text-cream font-medium text-xs px-3 py-2 rounded-lg shadow-sm transition"
          >
            {isSubmittingInvite ? "Sending..." : "Send invitation"}
          </button>
        </form>
      )}

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
