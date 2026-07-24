import { SavingGoalCard, type SavingGoalRow } from "./SavingGoalCard";
import { AddGoalTile } from "./AddGoalTile";

export function SavingGoalsSection({
  familyId,
  goals,
}: {
  familyId: string;
  goals: SavingGoalRow[];
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">Saving goals</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {goals.map((goal) => (
          <SavingGoalCard key={goal.id} goal={goal} />
        ))}
        <AddGoalTile familyId={familyId} />
      </div>
    </section>
  );
}
