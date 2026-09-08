"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ProgressBar } from "./ProgressBar";
import { AddContributionForm } from "./AddContributionForm";

export type SavingGoalRow = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  isAchieved: boolean;
};

export function SavingGoalCard({ familyId, goal }: { familyId: string; goal: SavingGoalRow }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(goal.name);
  const [targetAmount, setTargetAmount] = useState(String(goal.targetAmount));
  const [deadline, setDeadline] = useState(goal.deadline?.slice(0, 10) ?? "");
  const [isAchieved, setIsAchieved] = useState(goal.isAchieved);

  const updateGoal = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/family/${familyId}/saving-goals/${goal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          targetAmount: Number(targetAmount),
          deadline: deadline || null,
          isAchieved,
        }),
      });
      if (!res.ok) throw new Error("Failed to update saving goal");
      return res.json();
    },
    onSuccess: () => {
      setEditing(false);
      router.refresh();
    },
  });

  const deleteGoal = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/family/${familyId}/saving-goals/${goal.id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to delete saving goal");
      }
      return res.json();
    },
    onSuccess: () => router.refresh(),
  });

  if (editing) {
    return (
      <form
        className="rounded-2xl border border-bark p-4 shadow-sm flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (updateGoal.isPending) return;
          updateGoal.mutate();
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
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isAchieved}
            onChange={(e) => setIsAchieved(e.target.checked)}
          />
          Achieved
        </label>
        {updateGoal.isError && <p className="text-xs text-error">Could not save changes.</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={updateGoal.isPending}
            className="bg-bark text-cream px-3 py-1 rounded-lg text-sm disabled:opacity-50"
          >
            {updateGoal.isPending ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="border border-bark px-3 py-1 rounded-lg text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="rounded-2xl border border-bark p-4 shadow-sm flex flex-col gap-2">
      <p className="font-semibold">
        {goal.name}
        {goal.isAchieved ? " : Achieved" : ""}
      </p>
      <p className="text-sm">
        Target: {goal.targetAmount.toFixed(2)} PLN | Current: {goal.currentAmount.toFixed(2)} PLN
      </p>
      <ProgressBar value={goal.currentAmount} max={goal.targetAmount} />
      <div className="flex gap-2 text-xs">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="border border-bark rounded px-2 py-1"
        >
          Edit
        </button>
        {goal.currentAmount === 0 && (
          <button
            type="button"
            disabled={deleteGoal.isPending}
            onClick={() => {
              if (deleteGoal.isPending) return;
              if (confirm(`Delete goal "${goal.name}"?`)) deleteGoal.mutate();
            }}
            className="border border-bark rounded px-2 py-1 disabled:opacity-50"
          >
            {deleteGoal.isPending ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>
      {deleteGoal.isError && (
        <p className="text-xs text-error">{(deleteGoal.error as Error).message}</p>
      )}
      <AddContributionForm goalId={goal.id} />
    </div>
  );
}
