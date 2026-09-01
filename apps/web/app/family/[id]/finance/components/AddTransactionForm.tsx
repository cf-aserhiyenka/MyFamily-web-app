"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { createExpenseSchema } from "@myfamily/shared";
import type { BudgetRow } from "./BudgetCard";

export function AddTransactionForm({
  familyId,
  budgets,
  onDone,
}: {
  familyId: string;
  budgets: BudgetRow[];
  onDone: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [budgetId, setBudgetId] = useState("");

  const addExpense = useMutation({
    mutationFn: async () => {
      const payload = createExpenseSchema.parse({
        title,
        amount: Number(amount),
        date,
        note: note || undefined,
        budgetId: budgetId || undefined,
      });
      const res = await fetch(`/api/family/${familyId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create expense");
      return res.json();
    },
    onSuccess: () => {
      onDone();
      router.refresh();
    },
  });

  return (
    <form
      className="rounded-2xl border border-bark p-4 shadow-sm flex flex-col gap-2 mb-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (addExpense.isPending) return;
        if (title.trim() && Number(amount) > 0) addExpense.mutate();
      }}
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Expense title"
        className="border border-bark rounded-lg px-2 py-1 text-sm"
      />
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
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border border-bark rounded-lg px-2 py-1 text-sm"
      />
      <select
        value={budgetId}
        onChange={(e) => setBudgetId(e.target.value)}
        className="border border-bark rounded-lg px-2 py-1 text-sm"
      >
        <option value="">No budget</option>
        {budgets.map((budget) => (
          <option key={budget.id} value={budget.id}>
            {budget.category} — {budget.name}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (optional)"
        className="border border-bark rounded-lg px-2 py-1 text-sm"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={addExpense.isPending}
          className="bg-bark text-cream px-3 py-1 rounded-lg text-sm disabled:opacity-50"
        >
          {addExpense.isPending ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="border border-bark px-3 py-1 rounded-lg text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
