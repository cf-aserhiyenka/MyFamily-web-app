"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import type { BudgetRow } from "./BudgetCard";

export type TransactionRow = {
  id: string;
  title: string;
  amount: number;
  date: string;
  note: string | null;
  budgetId: string | null;
  payerName: string;
  budgetCategory: string | null;
};

function formatDate(iso: string) {
  return new Date(iso).toISOString().split("T")[0];
}

export function TransactionItem({
  familyId,
  budgets,
  transaction,
}: {
  familyId: string;
  budgets: BudgetRow[];
  transaction: TransactionRow;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(transaction.title);
  const [amount, setAmount] = useState(String(transaction.amount));
  const [date, setDate] = useState(formatDate(transaction.date));
  const [note, setNote] = useState(transaction.note ?? "");
  const [budgetId, setBudgetId] = useState(transaction.budgetId ?? "");

  const updateExpense = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/family/${familyId}/expenses/${transaction.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          amount: Number(amount),
          date,
          note: note || undefined,
          budgetId: budgetId || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to update transaction");
      return res.json();
    },
    onSuccess: () => {
      setEditing(false);
      router.refresh();
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/family/${familyId}/expenses/${transaction.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete transaction");
      return res.json();
    },
    onSuccess: () => router.refresh(),
  });

  if (editing) {
    return (
      <form
        className="border-b border-bark last:border-b-0 py-2 flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (updateExpense.isPending) return;
          updateExpense.mutate();
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
        {updateExpense.isError && <p className="text-xs text-error">Could not save changes.</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={updateExpense.isPending}
            className="bg-bark text-cream px-3 py-1 rounded-lg text-sm disabled:opacity-50"
          >
            {updateExpense.isPending ? "Saving..." : "Save"}
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
    <div className="border-b border-bark last:border-b-0 py-2">
      <p className="text-xs">{formatDate(transaction.date)}</p>
      <p className="text-sm">
        {transaction.title} — {transaction.amount.toFixed(2)} PLN
      </p>
      <p className="text-xs">
        Paid by: {transaction.payerName} | {" "}
        {transaction.budgetCategory ? `Category: ${transaction.budgetCategory}` : "No budget"}
      </p>
      <div className="flex gap-2 text-xs mt-1">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="border border-bark rounded px-2 py-1"
        >
          Edit
        </button>
        <button
          type="button"
          disabled={deleteExpense.isPending}
          onClick={() => {
            if (deleteExpense.isPending) return;
            if (confirm(`Delete transaction "${transaction.title}"?`)) deleteExpense.mutate();
          }}
          className="border border-bark rounded px-2 py-1 disabled:opacity-50"
        >
          {deleteExpense.isPending ? "Deleting..." : "Delete"}
        </button>
      </div>
      {deleteExpense.isError && <p className="text-xs text-error">Could not delete transaction.</p>}
    </div>
  );
}
