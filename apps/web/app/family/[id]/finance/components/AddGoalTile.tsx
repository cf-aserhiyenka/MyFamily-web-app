"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { createSavingGoalSchema } from "@myfamily/shared";

export function AddGoalTile({ familyId }: { familyId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");

  const addGoal = useMutation({
    mutationFn: async () => {
      const payload = createSavingGoalSchema.parse({
        name,
        targetAmount: Number(targetAmount),
        deadline: deadline || undefined,
      });
      const res = await fetch(`/api/family/${familyId}/saving-goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create saving goal");
      return res.json();
    },
    onSuccess: () => {
      setName("");
      setTargetAmount("");
      setDeadline("");
      setOpen(false);
      router.refresh();
    },
  });

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-2xl border border-bark p-4 shadow-sm flex items-center justify-center text-sm"
      >
        + Add new goal
      </button>
    );
  }

  return (
    <form
      className="rounded-2xl border border-bark p-4 shadow-sm flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (addGoal.isPending) return;
        addGoal.mutate();
      }}
    >
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Goal name"
        className="border border-bark rounded-lg px-2 py-1 text-sm"
      />
      <input
        type="number"
        step="0.01"
        min="0.01"
        value={targetAmount}
        onChange={(e) => setTargetAmount(e.target.value)}
        placeholder="Target amount PLN"
        className="border border-bark rounded-lg px-2 py-1 text-sm"
      />
      <input
        type="date"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        className="border border-bark rounded-lg px-2 py-1 text-sm"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={addGoal.isPending}
          className="bg-bark text-cream px-3 py-1 rounded-lg text-sm disabled:opacity-50"
        >
          {addGoal.isPending ? "Saving..." : "Save"}
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
