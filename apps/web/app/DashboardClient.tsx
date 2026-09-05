"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

type FamilyRow = {
  id: string;
  name: string;
  avatarBase64: string | null;
};

type DashboardClientProps = {
  firstName: string;
  families: FamilyRow[];
};

export function DashboardClient2(props: DashboardClientProps) {
  const firstName = props.firstName;
  const families = props.families;
  const initials = firstName ? firstName[0].toUpperCase() : "?";
  const hasFamilies = families.length > 0;

  return (
    <main className="min-h-screen p-4">
      <div className="items-center max-w-4xl mx-auto flex justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight ">MyFamily</h1>
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
          <h2 className="text-xl font-semibold">Welcome, {firstName}</h2>
          {hasFamilies && (
            <p className="text-sm mt-1">You have {families.length} families</p>
          )}
        </div>

        {hasFamilies ? (
          <div className="flex items-center flex-wrap justify-center gap-8 w-full">
            {families.map((family) => (
              <Link
                key={family.id}
                href={`/family/${family.id}/dashboard`}
                className="group flex flex-col items-center gap-2 shrink-0"
              >
                <div className="w-32 h-32 rounded-full bg-bark shadow-md overflow-hidden flex items-center justify-center transition-transform duration-300 ease-out group-hover:scale-125">
                  {family.avatarBase64 ? (
                    <img
                      src={family.avatarBase64}
                      alt={family.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-cream">
                      {family.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-center max-w-32 truncate">
                  {family.name}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="border border-bark p-6 flex flex-col items-center gap-3">
            <p className="text-sm ">You dont have any families. Join one or create your own.</p>
            <Link
              href="/profile"
              className="bg-bark text-cream font-medium text-sm px-5 py-2.5 rounded-lg"
            >
              Start
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
