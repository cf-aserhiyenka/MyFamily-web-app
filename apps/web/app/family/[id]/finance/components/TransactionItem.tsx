export type TransactionRow = {
  id: string;
  title: string;
  amount: number;
  date: string;
  payerName: string;
  budgetCategory: string | null;
};

// function formatDate(iso: string) {
//   const date = new Date(iso);
//   return date.toLocaleString("en-GB", {
//     day: "2-digit",
//     month: "2-digit",
//   });
// }

function formatDate(iso: string) {
  return new Date(iso).toISOString().split("T")[0];
}

export function TransactionItem({ transaction }: { transaction: TransactionRow }) {
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
    </div>
  );
}
