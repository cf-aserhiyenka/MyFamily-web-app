import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl text-green-800 ">
        MyFamily
      </h1>
      <p>Private space for your family2.</p>
      <div className="flex gap-4">
        <Link href="/login">Log in</Link>
        <Link href="/register">Sign up</Link>
      </div>
    </main>
  );
}
