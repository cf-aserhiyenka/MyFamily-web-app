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

export function FinanceClient({
  familyId,
  monthTotal,
  savingsTotal,
  budgets,
  savingGoals,
  transactions,
}: FinanceClientProps) {
  return (
    <div className="p-4 md:p-8 flex flex-col gap-6">
      <SummaryBar monthTotal={monthTotal} savingsTotal={savingsTotal} />
      <BudgetsSection familyId={familyId} budgets={budgets} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SavingGoalsSection familyId={familyId} goals={savingGoals} />
        <TransactionsSection familyId={familyId} budgets={budgets} transactions={transactions} />
      </div>
    </div>
  );
}
