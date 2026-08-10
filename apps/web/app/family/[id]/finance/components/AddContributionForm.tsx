"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

export function AddContributionForm({ goalId }: { goalId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const addContribution = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/saving-goals/${goalId}/contributions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), note: note || undefined }),
      });
      if (!res.ok) throw new Error("Failed to add contribution");
      return res.json();
    },
    onSuccess: () => {
      setAmount("");
      setNote("");
      setOpen(false);
      router.refresh();
    },
  });

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs border border-bark rounded px-2 py-1 self-start"
      >
        Add funds
      </button>
    );
  }

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        addContribution.mutate();
      }}
    >
      <input
        type="number"
        step="0.01"
        min="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount PLN"
        className="border border-bark rounded-lg px-2 py-1 text-sm"
      />
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (optional)"
        className="border border-bark rounded-lg px-2 py-1 text-sm"
      />
      <div className="flex gap-2">
        <button type="submit" className="bg-bark text-cream px-3 py-1 rounded-lg text-sm">
          Add funds
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="border border-bark px-3 py-1 rounded-lg text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
