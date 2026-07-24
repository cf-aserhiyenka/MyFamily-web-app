import { ProgressBar } from "./ProgressBar";
import { AddContributionForm } from "./AddContributionForm";

export type SavingGoalRow = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
};

export function SavingGoalCard({ goal }: { goal: SavingGoalRow }) {
  const pct = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;

  return (
    <div className="rounded-2xl border border-bark p-4 shadow-sm flex flex-col gap-2">
      <p className="font-semibold">{goal.name}</p>
      <p className="text-sm">
        Target: {goal.targetAmount.toFixed(2)} PLN | Current: {goal.currentAmount.toFixed(2)} PLN
      </p>
      <ProgressBar pct={pct} />
      <AddContributionForm goalId={goal.id} />
    </div>
  );
}
