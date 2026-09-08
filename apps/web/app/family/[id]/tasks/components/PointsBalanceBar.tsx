"use client";

export type PointsBalanceRow = {
  memberId: string;
  name: string;
  balance: number;
};

export function PointsBalanceBar({ myBalance }: { myBalance: number }) {
  return (
    <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-bark p-4 shadow-sm">
      <p>
        Your points: <span className="font-semibold">{myBalance}</span>
      </p>
    </div>
  );
}
