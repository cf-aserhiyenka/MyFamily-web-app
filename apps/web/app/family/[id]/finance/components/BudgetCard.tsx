"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ProgressBar } from "./ProgressBar";
import { BUDGET_CATEGORIES, BUDGET_PERIODS } from "./constants";

export type BudgetRow = {
  id: string;
  name: string;
  category: string;
  period: "WEEKLY" | "MONTHLY" | "YEARLY";
  limitAmount: number;
  spentAmount: number;
};

export function BudgetCard({ familyId, budget }: { familyId: string; budget: BudgetRow }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(budget.name);
  const [category, setCategory] = useState(budget.category as (typeof BUDGET_CATEGORIES)[number]);
  const [limitAmount, setLimitAmount] = useState(String(budget.limitAmount));
  const [period, setPeriod] = useState(budget.period);

  const updateBudget = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/family/${familyId}/budgets/${budget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, limitAmount: Number(limitAmount), period }),
      });
      if (!res.ok) throw new Error("Failed to update budget");
      return res.json();
    },
    onSuccess: () => {
      setEditing(false);
      router.refresh();
    },
  });

  const deleteBudget = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/family/${familyId}/budgets/${budget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete budget");
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
          if (updateBudget.isPending) return;
          updateBudget.mutate();
        }}
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Budget name"
          className="border border-bark rounded-lg px-2 py-1 text-sm"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as (typeof BUDGET_CATEGORIES)[number])}
          className="border border-bark rounded-lg px-2 py-1 text-sm"
        >
          {BUDGET_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={limitAmount}
          onChange={(e) => setLimitAmount(e.target.value)}
          placeholder="Limit PLN"
          className="border border-bark rounded-lg px-2 py-1 text-sm"
        />
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as (typeof BUDGET_PERIODS)[number])}
          className="border border-bark rounded-lg px-2 py-1 text-sm"
        >
          {BUDGET_PERIODS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        {updateBudget.isError && <p className="text-xs text-red-600">Could not save changes.</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={updateBudget.isPending}
            className="bg-bark text-cream px-3 py-1 rounded-lg text-sm disabled:opacity-50"
          >
            {updateBudget.isPending ? "Saving..." : "Save"}
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
        {budget.category} ({budget.period})
      </p>
      <p className="text-sm">
        {budget.spentAmount.toFixed(2)} / {budget.limitAmount.toFixed(2)} PLN
      </p>
      <ProgressBar value={budget.spentAmount} max={budget.limitAmount} />
      <div className="flex gap-2 text-xs">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="border border-bark rounded px-2 py-1"
        >
          Edit
        </button>
        <button
          type="button"
          disabled={deleteBudget.isPending}
          onClick={() => {
            if (deleteBudget.isPending) return;
            if (confirm(`Delete budget "${budget.name}"?`)) deleteBudget.mutate();
          }}
          className="border border-bark rounded px-2 py-1 disabled:opacity-50"
        >
          {deleteBudget.isPending ? "Deleting..." : "Delete"}
        </button>
      </div>
      {deleteBudget.isError && <p className="text-xs text-red-600">Could not delete budget.</p>}
    </div>
  );
}
