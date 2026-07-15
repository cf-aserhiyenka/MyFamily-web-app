"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

type FamilyRow = {
  id: string;
  name: string;
  memberCount: number;
};

type DashboardClientProps = {
  firstName: string;
  families: FamilyRow[];
};

export function DashboardClient({ firstName, families }: DashboardClientProps) {
  const initials = firstName ? firstName[0].toUpperCase() : "?";
  const hasFamilies = families.length > 0;

  return (
    <main className="min-h-screen p-4 md:p-12">
      {/* Header: app name + avatar (links to profile) + log out */}
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-10">
        <h1 className="text-2xl font-bold tracking-tight">MyFamily</h1>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => signOut()} className="text-sm hover:underline">
            Log out
          </button>
          <Link
            href="/profile"
            className="w-10 h-10 rounded-full bg-bark text-cream flex items-center justify-center font-bold text-sm"
          >
            {initials}
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-semibold">Welcome, {firstName || "there"}</h2>
          {hasFamilies && (
            <p className="text-sm mt-1">
              You have {families.length} {families.length === 1 ? "family" : "families"}
            </p>
          )}
        </div>

        {hasFamilies ? (
          <div className="flex flex-col gap-4">
            {families.map((family) => (
              <div key={family.id} className="rounded-2xl border border-bark p-4 shadow-sm">
                <p className="text-sm font-semibold">{family.name}</p>
                <p className="text-xs mt-1">
                  {family.memberCount} {family.memberCount === 1 ? "member" : "members"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state: this is the first of the "2 places" — the other is the
             "+ Create new family" tile on /profile, handled as a separate step. */
          <div className="rounded-2xl border border-bark p-6 shadow-sm flex flex-col items-center gap-3 text-center">
            <p className="text-sm">You dont have any families yet. Join one or create your own.</p>
            <Link
              href="/profile"
              className="bg-bark text-cream font-medium text-sm px-5 py-2.5 rounded-lg shadow-sm transition"
            >
              Start
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
