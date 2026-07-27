"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type MemberRow = {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: "PARENT" | "CHILD" | "GUARDIAN" | "SENIOR";
  isOwner: boolean;
};

type MembersSectionProps = {
  familyId: string;
  members: MemberRow[];
  canManageFamily: boolean;
  currentUserId: string;
};

export function MembersSection({ familyId, members, canManageFamily, currentUserId }: MembersSectionProps) {
  const router = useRouter();
  const [actionError, setActionError] = useState("");
  const [pendingMemberId, setPendingMemberId] = useState<string | null>(null);

  async function onRoleChange(memberId: string, role: string) {
    setActionError("");
    setPendingMemberId(memberId);

    const response = await fetch(`/api/family/${familyId}/members/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });

    setPendingMemberId(null);

    if (!response.ok) {
      const body = await response.json();
      setActionError(body.error ?? "Could not update role.");
      return;
    }

    router.refresh();
  }

  async function onRemoveMember(member: MemberRow) {
    if (!confirm(`Remove ${member.name} from this family?`)) return;

    setActionError("");
    setPendingMemberId(member.id);

    const response = await fetch(`/api/family/${familyId}/members/${member.id}`, {
      method: "DELETE",
    });

    setPendingMemberId(null);

    if (!response.ok) {
      const body = await response.json();
      setActionError(body.error ?? "Could not remove member.");
      return;
    }

    router.refresh();
  }

  async function onLeaveFamily() {
    if (!confirm("Are you sure you want to leave this family?")) return;

    setActionError("");

    const response = await fetch(`/api/family/${familyId}/leave`, { method: "POST" });

    if (!response.ok) {
      const body = await response.json();
      setActionError(body.error ?? "Could not leave family.");
      return;
    }

    router.push("/profile");
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-bark p-6 shadow-sm flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Members</h2>
        <p className="text-xs">Everyone who is currently part of this family.</p>
      </div>

      {actionError && <p className="text-xs">{actionError}</p>}

      <ul className="flex flex-col gap-3">
        {members.map((member) => {
          const isSelf = member.userId === currentUserId;
          const isPending = pendingMemberId === member.id;

          return (
            <li
              key={member.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-bark"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-bark text-cream flex items-center justify-center font-bold text-sm">
                  {member.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {member.name} {isSelf && <span className="text-xs font-normal">(you)</span>}
                  </p>
                  <p className="text-xs">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {canManageFamily && !member.isOwner ? (
                  <select
                    className="rounded-lg border border-bark p-1.5 text-xs focus:outline-none transition"
                    value={member.role}
                    disabled={isPending}
                    onChange={(e) => onRoleChange(member.id, e.target.value)}
                  >
                    <option value="PARENT">Parent</option>
                    <option value="CHILD">Child</option>
                    <option value="GUARDIAN">Guardian</option>
                    <option value="SENIOR">Senior</option>
                  </select>
                ) : (
                  <span className="inline-block bg-bark text-cream text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {member.isOwner ? "Owner" : member.role}
                  </span>
                )}

                {canManageFamily && !member.isOwner && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => onRemoveMember(member)}
                    className="text-xs border border-bark font-medium px-3 py-1.5 rounded-lg transition"
                  >
                    Remove
                  </button>
                )}

                {isSelf && !member.isOwner && member.role !== "CHILD" && (
                  <button
                    type="button"
                    onClick={onLeaveFamily}
                    className="text-xs border border-bark font-medium px-3 py-1.5 rounded-lg transition"
                  >
                    Leave family
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
