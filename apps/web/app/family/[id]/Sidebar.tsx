import Link from "next/link";

// TODO: map function
export function Sidebar({
  familyId,
  familyName,
  userName,
}: {
  familyId: string;
  familyName: string;
  userName?: string;
}) {


  return (
    <aside className="flex flex-col w-64 border-r p-4">
      <h2 className="font-bold">Family</h2>
      <p className="text-sm text-gray-500 mb-6">{familyName}</p>

      <nav className="flex flex-col gap-2 flex-1">
        <Link href="/">Home</Link>
        <Link href={`/family/${familyId}/dashboard`}>
          Dashboard
        </Link>

        <Link href={`/family/${familyId}/tree`}>
          Tree
        </Link>

        <Link href={`/family/${familyId}/archive`}>
          Gallery
        </Link>

        <Link href={`/family/${familyId}/chat`}>
          Chat
        </Link>

        <Link href={`/family/${familyId}/finance`}>
          Finance
        </Link>

        <Link href={`/family/${familyId}/tasks`}>
          Tasks
        </Link>
        
        <Link href={`/family/${familyId}/settings`}>
          Settings
        </Link>
      </nav>

      {userName && (
        <div className="pt-4 mt-4 border-t text-sm text-gray-700">
          Logged in as: <span className="font-medium">{userName}</span>
        </div>
      )}
    </aside>
  );
}
