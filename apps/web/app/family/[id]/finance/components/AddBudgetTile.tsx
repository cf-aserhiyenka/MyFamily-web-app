"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { BUDGET_CATEGORIES, BUDGET_PERIODS } from "./constants";

export function AddBudgetTile({ familyId }: { familyId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<(typeof BUDGET_CATEGORIES)[number]>("GROCERIES");
  const [limitAmount, setLimitAmount] = useState("");
  const [period, setPeriod] = useState<(typeof BUDGET_PERIODS)[number]>("MONTHLY");

  const addBudget = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/family/${familyId}/budgets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, limitAmount: Number(limitAmount), period }),
      });
      if (!res.ok) throw new Error("Failed to create budget");
      return res.json();
    },
    onSuccess: () => {
      setName("");
      setLimitAmount("");
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
        + Add new category
      </button>
    );
  }

  return (
    <form
      className="rounded-2xl border border-bark p-4 shadow-sm flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        addBudget.mutate();
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
      <div className="flex gap-2">
        <button type="submit" className="bg-bark text-cream px-3 py-1 rounded-lg text-sm">
          Save
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
