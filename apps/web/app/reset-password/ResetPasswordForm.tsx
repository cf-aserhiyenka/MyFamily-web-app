"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@myfamily/shared";

export function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  async function onSubmit(data: ResetPasswordInput) {
    setServerError("");

    const response = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const body = await response.json();
      setServerError(body.error ?? "Could not reset password");
      return;
    }

    router.push("/login");
  }

  if (!token) {
    return <p>This link is invalid or has expired.</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-64 flex-col gap-2">
      <input type="hidden" {...register("token")} />

      <input
        type="password"
        placeholder="New password"
        className="border border-bark p-2"
        {...register("newPassword")}
      />
      {errors.newPassword && <p>{errors.newPassword.message}</p>}

      <input
        type="password"
        placeholder="Confirm new password"
        className="border border-bark p-2"
        {...register("confirmNewPassword")}
      />
      {errors.confirmNewPassword && <p>{errors.confirmNewPassword.message}</p>}

      {serverError && <p>{serverError}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Resetting..." : "Reset password"}
      </button>
    </form>
  );
}
