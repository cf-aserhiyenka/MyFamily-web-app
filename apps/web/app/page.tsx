"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl text-green-800 ">
        MyFamily
      </h1>
      <p>Private space for your family2.</p>

      {session ? (
        <div className="flex flex-col items-center gap-2">
          <p>Logged in as {session.user?.name}</p>
          <button onClick={() => signOut()}>Log out</button>
        </div>
      ) : (
        <div className="flex gap-4">
          <Link href="/login">Log in</Link>
          <Link href="/register">Sign up</Link>
        </div>
      )}
    </main>
  );
}
