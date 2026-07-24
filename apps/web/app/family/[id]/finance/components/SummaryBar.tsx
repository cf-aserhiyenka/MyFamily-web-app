export function SummaryBar({
  monthTotal,
  savingsTotal,
}: {
  monthTotal: number;
  savingsTotal: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-bark p-4 shadow-sm">
      <p>
        Spent this month: <span className="font-semibold">{monthTotal.toFixed(2)} PLN</span>
      </p>
      <p>
        Savings: <span className="font-semibold">{savingsTotal.toFixed(2)} PLN</span>
      </p>
    </div>
  );
}
