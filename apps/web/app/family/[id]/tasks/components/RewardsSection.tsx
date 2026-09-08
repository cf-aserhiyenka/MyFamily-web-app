"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createRewardSchema } from "@myfamily/shared";
import { RewardCard } from "./RewardCard";

export type RewardRow = {
  id: string;
  name: string;
  description: string | null;
  pointCost: number;
  stock: number | null;
};

function AddRewardTile({ familyId, onCreated }: { familyId: string; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pointCost, setPointCost] = useState("10");
  const [stock, setStock] = useState("");

  const addReward = useMutation({
    mutationFn: async () => {
      const payload = createRewardSchema.parse({
        name,
        description: description || undefined,
        pointCost: Number(pointCost),
        stock: stock ? Number(stock) : undefined,
      });
      const res = await fetch(`/api/family/${familyId}/rewards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create reward");
      return res.json();
    },
    onSuccess: () => {
      setName("");
      setDescription("");
      setPointCost("10");
      setStock("");
      setOpen(false);
      onCreated();
    },
  });

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-2xl border border-bark p-4 shadow-sm flex items-center justify-center text-sm"
      >
        + Add reward
      </button>
    );
  }

  return (
    <form
      className="rounded-2xl border border-bark p-4 shadow-sm flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (addReward.isPending) return;
        if (name.trim() && Number(pointCost) > 0) addReward.mutate();
      }}
    >
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Reward name"
        className="border border-bark rounded-lg px-2 py-1 text-sm"
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className="border border-bark rounded-lg px-2 py-1 text-sm"
      />
      <input
        type="number"
        step="1"
        min="1"
        value={pointCost}
        onChange={(e) => setPointCost(e.target.value)}
        placeholder="Point cost"
        className="border border-bark rounded-lg px-2 py-1 text-sm"
      />
      <input
        type="number"
        step="1"
        min="0"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        placeholder="Stock (leave empty for unlimited)"
        className="border border-bark rounded-lg px-2 py-1 text-sm"
      />
      {addReward.isError && <p className="text-xs text-error">Could not save reward.</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={addReward.isPending}
          className="bg-bark text-cream px-3 py-1 rounded-lg text-sm disabled:opacity-50"
        >
          {addReward.isPending ? "Saving..." : "Save"}
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

export function RewardsSection({
  familyId,
  myBalance,
  canManageTasks,
  rewards,
  onChanged,
}: {
  familyId: string;
  myBalance: number;
  canManageTasks: boolean;
  rewards: RewardRow[];
  onChanged: () => void;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">Rewards</h2>
      <div className="flex flex-col gap-2">
        {rewards.map((reward) => (
          <RewardCard key={reward.id} myBalance={myBalance} reward={reward} onChanged={onChanged} />
        ))}
        {rewards.length === 0 && <p className="text-sm">No rewards yet.</p>}
        {canManageTasks && <AddRewardTile familyId={familyId} onCreated={onChanged} />}
      </div>
    </section>
  );
}
