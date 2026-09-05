"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar({
  familyId,
  familyName,
  userName,
}: {
  familyId: string;
  familyName: string;
  userName?: string;
}) {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: `/family/${familyId}/dashboard`, label: "Dashboard" },
    { href: `/family/${familyId}/tree`, label: "Tree" },
    { href: `/family/${familyId}/archive`, label: "Gallery" },
    { href: `/family/${familyId}/chat`, label: "Chat" },
    { href: `/family/${familyId}/finance`, label: "Finance" },
    { href: `/family/${familyId}/tasks`, label: "Tasks" },
    { href: `/family/${familyId}/settings`, label: "Settings" },
  ];

  return (
    <aside className="flex flex-col w-64 border-r p-4">
      <h2 className="font-bold">Family</h2>
      <p className="text-sm text-gray-500 mb-6">{familyName}</p>

      <nav className="flex flex-col gap-2 flex-1">
        {links.map((link) => {
          const isActive =
            link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={isActive ? "font-semibold text-bark underline" : undefined}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {userName && (
        <div className="pt-4 mt-4 border-t text-sm text-gray-700">
          Logged in as: <span className="font-medium">{userName}</span>
        </div>
      )}
    </aside>
  );
}
