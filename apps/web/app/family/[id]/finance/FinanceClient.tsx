"use client";

import { useState } from "react";
import { SummaryBar } from "./components/SummaryBar";
import { BudgetsSection } from "./components/BudgetsSection";
import { SavingGoalsSection } from "./components/SavingGoalsSection";
import { TransactionsSection } from "./components/TransactionsSection";
import type { BudgetRow } from "./components/BudgetCard";
import type { SavingGoalRow } from "./components/SavingGoalCard";
import type { TransactionRow } from "./components/TransactionItem";

type FinanceClientProps = {
  familyId: string;
  monthTotal: number;
  savingsTotal: number;
  budgets: BudgetRow[];
  savingGoals: SavingGoalRow[];
  transactions: TransactionRow[];
};

const TABS = [
  { key: "budgets", label: "Budgets" },
  { key: "goals", label: "Goals" },
  { key: "payments", label: "Payments" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function FinanceClient({
  familyId,
  monthTotal,
  savingsTotal,
  budgets,
  savingGoals,
  transactions,
}: FinanceClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("budgets");

  return (
    <div className="p-4 md:p-8 flex flex-col gap-6">
      <SummaryBar monthTotal={monthTotal} savingsTotal={savingsTotal} />

      <nav className="flex gap-2 border-b border-bark">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px ${
              activeTab === tab.key ? "border-bark" : "border-transparent text-bark/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "budgets" && <BudgetsSection familyId={familyId} budgets={budgets} />}
      {activeTab === "goals" && <SavingGoalsSection familyId={familyId} goals={savingGoals} />}
      {activeTab === "payments" && (
        <TransactionsSection familyId={familyId} budgets={budgets} transactions={transactions} />
      )}
    </div>
  );
}
