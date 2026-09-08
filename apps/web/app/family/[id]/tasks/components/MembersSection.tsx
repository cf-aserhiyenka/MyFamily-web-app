"use client";

import type { PointsBalanceRow } from "./PointsBalanceBar";

export function MembersSection({
  myMemberId,
  balances,
}: {
  myMemberId: string;
  balances: PointsBalanceRow[];
}) {
  return (
    <section className="flex flex-col gap-2">
      {balances.map((b) => (
        <div
          key={b.memberId}
          className="rounded-2xl border border-bark p-4 shadow-sm flex items-center justify-between"
        >
          <p className="text-sm font-semibold">
            {b.name}
            {b.memberId === myMemberId ? " (you)" : ""}
          </p>
          <p className="text-sm">{b.balance} pts</p>
        </div>
      ))}
      {balances.length === 0 && <p className="text-sm">No members yet.</p>}
    </section>
  );
}
