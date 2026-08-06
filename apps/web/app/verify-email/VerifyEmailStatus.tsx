"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export function VerifyEmailStatus() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    fetch("/api/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).then((response) => {
      setStatus(response.ok ? "success" : "error");
    });
  }, [token]);

  if (status === "loading") {
    return <p>Confirming your email...</p>;
  }

  if (status === "success") {
    return (
      <>
        <p>Your email has been confirmed.</p>
        <Link href="/login" className="underline">
          Go to login
        </Link>
      </>
    );
  }

  return <p>This link is invalid or has expired.</p>;
}
