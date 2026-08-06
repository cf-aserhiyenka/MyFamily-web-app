import { Suspense } from "react";
import { VerifyEmailStatus } from "./VerifyEmailStatus";

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl">Email verification</h1>
      <Suspense fallback={<p>Confirming your email...</p>}>
        <VerifyEmailStatus />
      </Suspense>
    </main>
  );
}
