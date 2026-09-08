"use client";

import { useMutation } from "@tanstack/react-query";
import type { RewardRow } from "./RewardsSection";

export function RewardCard({
  myBalance,
  reward,
  onChanged,
}: {
  myBalance: number;
  reward: RewardRow;
  onChanged: () => void;
}) {
  const redeem = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/rewards/${reward.id}/redeem`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to redeem reward");
      return res.json();
    },
    onSuccess: onChanged,
  });

  const outOfStock = reward.stock !== null && reward.stock <= 0;
  const canAfford = myBalance >= reward.pointCost;

  return (
    <div className="rounded-2xl border border-bark p-4 shadow-sm flex flex-col gap-1">
      <p className="text-sm font-semibold">
        {reward.name} — {reward.pointCost} pts
      </p>
      {reward.description && <p className="text-xs">{reward.description}</p>}
      {reward.stock !== null && <p className="text-xs">Stock: {reward.stock}</p>}

      <button
        type="button"
        disabled={redeem.isPending || outOfStock || !canAfford}
        onClick={() => redeem.mutate()}
        className="border border-bark rounded px-2 py-1 text-xs disabled:opacity-50 self-start mt-1"
      >
        {outOfStock ? "Out of stock" : redeem.isPending ? "Redeeming..." : "Redeem"}
      </button>
      {!outOfStock && !canAfford && <p className="text-xs">Not enough points.</p>}
      {redeem.isError && <p className="text-xs text-error">Could not redeem, try again.</p>}
    </div>
  );
}
