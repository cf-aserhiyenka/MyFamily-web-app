import Link from "next/link";

// TODO: map function
export function Sidebar({ familyId, familyName }: { familyId: string; familyName: string }) {


  return (
    <aside className="flex flex-col w-64 border-r p-4">
      <h2 className="font-bold">Family</h2>
      <p className="text-sm text-gray-500 mb-6">{familyName}</p>

      <nav className="flex flex-col gap-2">
        <Link href="/">Home</Link>
        <Link href={`/family/${familyId}/dashboard`}>
          Dashboard
        </Link>

        <Link href={`/family/${familyId}/tree`}>
          Tree
        </Link>

        <Link href={`/family/${familyId}/archive`}>
          Archive
        </Link>

        <Link href={`/family/${familyId}/calendar`}>
          Calendar
        </Link>

        <Link href={`/family/${familyId}/chat`}>
          Chat
        </Link>

        <Link href={`/family/${familyId}/tasks`}>
          Tasks
        </Link>

        <Link href={`/family/${familyId}/finance`}>
          Finance
        </Link>
        <Link href={`/family/${familyId}/settings`}>
          Settings
        </Link>
      </nav>
    </aside>
  );
}
