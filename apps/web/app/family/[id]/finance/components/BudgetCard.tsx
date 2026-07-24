import { ProgressBar } from "./ProgressBar";

export type BudgetRow = {
  id: string;
  name: string;
  category: string;
  period: "WEEKLY" | "MONTHLY" | "YEARLY";
  limitAmount: number;
  spentAmount: number;
};

export function BudgetCard({ budget }: { budget: BudgetRow }) {
  const pct = budget.limitAmount > 0 ? (budget.spentAmount / budget.limitAmount) * 100 : 0;

  return (
    <div className="rounded-2xl border border-bark p-4 shadow-sm flex flex-col gap-2">
      <p className="font-semibold">
        {budget.category} ({budget.period})
      </p>
      <p className="text-sm">
        {budget.spentAmount.toFixed(2)} / {budget.limitAmount.toFixed(2)} PLN
      </p>
      <ProgressBar pct={pct} />
    </div>
  );
}
