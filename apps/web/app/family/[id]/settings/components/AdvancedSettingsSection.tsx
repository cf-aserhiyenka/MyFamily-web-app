"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AdvancedSettingsSectionProps = {
  familyId: string;
  familyName: string;
  canDeleteFamily: boolean;
};

export function AdvancedSettingsSection({ familyId, familyName, canDeleteFamily }: AdvancedSettingsSectionProps) {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const canConfirm = confirmText.trim() === familyName;

  async function onDeleteFamily() {
    setDeleteError("");
    setIsDeleting(true);

    const response = await fetch(`/api/family/${familyId}`, { method: "DELETE" });

    setIsDeleting(false);

    if (!response.ok) {
      const body = await response.json();
      setDeleteError(body.error ?? "Could not delete family.");
      return;
    }

    router.push("/profile");
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-bark p-6 shadow-sm flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Advanced Settings</h2>
        <p className="text-xs">Deleting a family cannot be undone.</p>
      </div>

      {!canDeleteFamily ? (
        <p className="text-xs">Only the family owner can delete this family.</p>
      ) : (
        <div className="flex flex-col gap-2 p-3 rounded-xl border border-bark">
          <p className="text-xs">
            Type <span className="font-semibold">{familyName}</span> to confirm deletion.
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="rounded-lg border border-bark p-2 text-sm focus:outline-none transition"
          />
          {deleteError && <span className="text-xs">{deleteError}</span>}
          <button
            type="button"
            disabled={!canConfirm || isDeleting}
            onClick={onDeleteFamily}
            className="self-start bg-bark text-cream font-medium text-xs px-4 py-2 rounded-lg shadow-sm transition disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete this family"}
          </button>
        </div>
      )}
    </section>
  );
}
