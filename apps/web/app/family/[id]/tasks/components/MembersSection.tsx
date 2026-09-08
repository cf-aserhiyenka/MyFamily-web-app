"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { manualPointAdjustmentSchema } from "@myfamily/shared";
import type { PointsBalanceRow } from "./PointsBalanceBar";

function AdjustPointsForm({
  familyId,
  memberId,
  onChanged,
}: {
  familyId: string;
  memberId: string;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const adjust = useMutation({
    mutationFn: async () => {
      const payload = manualPointAdjustmentSchema.parse({
        memberId,
        amount: Number(amount),
        reason,
      });
      const res = await fetch(`/api/family/${familyId}/points/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to adjust points");
      return res.json();
    },
    onSuccess: () => {
      setAmount("");
      setReason("");
      setOpen(false);
      onChanged();
    },
  });

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border border-bark rounded px-2 py-1 text-xs"
      >
        Adjust points
      </button>
    );
  }

  return (
    <form
      className="flex flex-col gap-2 mt-2 w-full"
      onSubmit={(e) => {
        e.preventDefault();
        if (adjust.isPending) return;
        if (Number(amount) !== 0 && reason.trim()) adjust.mutate();
      }}
    >
      <div className="flex gap-2">
        <input
          type="number"
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (+/-)"
          className="border border-bark rounded-lg px-2 py-1 text-xs w-32"
        />
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason"
          className="border border-bark rounded-lg px-2 py-1 text-xs flex-1"
        />
      </div>
      {adjust.isError && <p className="text-xs text-error">Could not adjust points.</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={adjust.isPending}
          className="bg-bark text-cream px-3 py-1 rounded-lg text-xs disabled:opacity-50"
        >
          {adjust.isPending ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="border border-bark px-3 py-1 rounded-lg text-xs"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function MembersSection({
  familyId,
  myMemberId,
  canManageTasks,
  balances,
  onChanged,
}: {
  familyId: string;
  myMemberId: string;
  canManageTasks: boolean;
  balances: PointsBalanceRow[];
  onChanged: () => void;
}) {
  return (
    <section className="flex flex-col gap-2">
      {balances.map((b) => (
        <div
          key={b.memberId}
          className="rounded-2xl border border-bark p-4 shadow-sm flex flex-wrap items-center justify-between gap-2"
        >
          <p className="text-sm font-semibold">
            {b.name}
            {b.memberId === myMemberId ? " (you)" : ""}
          </p>
          <p className="text-sm">{b.balance} pts</p>
          {canManageTasks && (
            <AdjustPointsForm familyId={familyId} memberId={b.memberId} onChanged={onChanged} />
          )}
        </div>
      ))}
      {balances.length === 0 && <p className="text-sm">No members yet.</p>}
    </section>
  );
}
