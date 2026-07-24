"use client";

import { useState } from "react";
import { TransactionItem, type TransactionRow } from "./TransactionItem";
import { AddTransactionForm } from "./AddTransactionForm";
import type { BudgetRow } from "./BudgetCard";

export function TransactionsSection({
  familyId,
  budgets,
  transactions,
}: {
  familyId: string;
  budgets: BudgetRow[];
  transactions: TransactionRow[];
}) {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent transactions</h2>
        {!formOpen && (
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="bg-bark text-cream px-3 py-1 rounded-lg text-sm"
          >
            Add Transaction
          </button>
        )}
      </div>

      {formOpen && (
        <AddTransactionForm familyId={familyId} budgets={budgets} onDone={() => setFormOpen(false)} />
      )}

      <div className="rounded-2xl border border-bark p-4 shadow-sm">
        {transactions.length === 0 && <p className="text-sm">No transactions yet.</p>}
        {transactions.map((transaction) => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </section>
  );
}
