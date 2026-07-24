import { BudgetCard, type BudgetRow } from "./BudgetCard";
import { AddBudgetTile } from "./AddBudgetTile";

export function BudgetsSection({ familyId, budgets }: { familyId: string; budgets: BudgetRow[] }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">Budgets and limits</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {budgets.map((budget) => (
          <BudgetCard key={budget.id} budget={budget} />
        ))}
        <AddBudgetTile familyId={familyId} />
      </div>
    </section>
  );
}
