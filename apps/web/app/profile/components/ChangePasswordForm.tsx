"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, type ChangePasswordInput } from "@myfamily/shared";

export function ChangePasswordForm() {
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  async function onPasswordSubmit(data: ChangePasswordInput) {
    setPasswordError("");
    setPasswordSuccess(false);

    const response = await fetch("/api/profile/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const body = await response.json();
      setPasswordError(body.error ?? "Could not change password.");
      return;
    }

    resetPasswordForm();
    setPasswordSuccess(true);
  }

  return (
    <form
      className="flex flex-col gap-3 border-t border-bark pt-5"
      onSubmit={handlePasswordSubmit(onPasswordSubmit)}
    >
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Current password
        <input
          type="password"
          className="rounded-lg border border-bark p-2.5 focus:outline-none transition"
          {...registerPassword("currentPassword")}
        />
        {passwordErrors.currentPassword && (
          <span className="text-xs">{passwordErrors.currentPassword.message}</span>
        )}
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        New password
        <input
          type="password"
          className="rounded-lg border border-bark p-2.5 focus:outline-none transition"
          {...registerPassword("newPassword")}
        />
        {passwordErrors.newPassword && (
          <span className="text-xs">{passwordErrors.newPassword.message}</span>
        )}
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Confirm new password
        <input
          type="password"
          className="rounded-lg border border-bark p-2.5 focus:outline-none transition"
          {...registerPassword("confirmNewPassword")}
        />
        {passwordErrors.confirmNewPassword && (
          <span className="text-xs">{passwordErrors.confirmNewPassword.message}</span>
        )}
      </label>

      {passwordError && <p className="text-sm">{passwordError}</p>}
      {passwordSuccess && <p className="text-sm">Password changed.</p>}

      <button
        type="submit"
        disabled={isSubmittingPassword}
        className="self-start bg-bark text-cream font-medium text-sm px-5 py-2.5 rounded-lg shadow-sm transition"
      >
        {isSubmittingPassword ? "Saving..." : "Save password"}
      </button>
    </form>
  );
}
