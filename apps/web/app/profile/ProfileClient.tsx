"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateProfileSchema,
  type UpdateProfileInput,
  changePasswordSchema,
  type ChangePasswordInput,
} from "@myfamily/shared";

type FamilyRow = {
  id: string;
  name: string;
  role: string;
  isOwner: boolean;
};

type ProfileClientProps = {
  email: string;
  firstName: string;
  lastName: string;
  birthDate: string; // "YYYY-MM-DD" or "" if unknown
  avatarBase64: string | null;
  families: FamilyRow[];
};

export function ProfileClient({
  email,
  firstName,
  lastName,
  birthDate,
  avatarBase64,
  families,
}: ProfileClientProps) {
  // Example state to demonstrate interaction
  const [avatar, setAvatar] = useState<string | null>(avatarBase64);
  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();

  const router = useRouter();
  const [saveError, setSaveError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { firstName, lastName, birthDate },
  });

  async function onSubmit(data: UpdateProfileInput) {
    setSaveError("");

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      setSaveError("Could not save changes.");
      return;
    }

    router.refresh();
  }

  // Show/hide the password form; separate from the profile form above
  const [showPasswordForm, setShowPasswordForm] = useState(false);
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
    <main className="min-h-screen p-4 md:p-12">
      {/* Header with navigation */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm hover:underline transition mb-3"
        >
          <span>←</span> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-sm">Manage your personal information and family memberships.</p>
      </div>

      {/* Two-column grid on desktop */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: Personal data (spans 2 columns on large screens) */}
        <section className="lg:col-span-2 rounded-2xl border border-bark p-6 shadow-sm flex flex-col gap-6">
          <div className="border-b border-bark pb-4">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            <p className="text-xs">Update your personal details and how others see you.</p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Avatar section */}
            <div className="flex items-center gap-5 p-4 rounded-xl border border-bark">
              <div className="relative group w-20 h-20 rounded-full bg-bark border-2 border-cream shadow-md overflow-hidden flex items-center justify-center cursor-pointer">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-cream">{initials}</span>
                )}
                <div className="absolute inset-0 bg-bark opacity-0 group-hover:opacity-90 transition flex items-center justify-center">
                  <span className="text-[10px] text-cream font-medium text-center px-1">Change</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium">Profile Photo</h4>
                <p className="text-xs mt-1">PNG, JPG up to 5MB. Recommended: 250x250px</p>
                <button type="button" className="text-xs font-semibold hover:underline mt-2">
                  Upload new image
                </button>
              </div>
            </div>

            {/* Form fields in a 2x2 grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                First name
                <input
                  type="text"
                  className="rounded-lg border border-bark p-2.5 focus:outline-none transition"
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <span className="text-xs">{errors.firstName.message}</span>
                )}
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Last name
                <input
                  type="text"
                  className="rounded-lg border border-bark p-2.5 focus:outline-none transition"
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <span className="text-xs">{errors.lastName.message}</span>
                )}
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-medium md:col-span-2">
                Email Address
                <input
                  type="email"
                  className="rounded-lg border border-bark p-2.5 focus:outline-none transition"
                  defaultValue={email}
                  disabled
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-medium md:col-span-2">
                Birth date
                <input
                  type="date"
                  className="rounded-lg border border-bark p-2.5 focus:outline-none transition"
                  {...register("birthDate")}
                />
              </label>
            </div>

            {saveError && <p className="text-sm">{saveError}</p>}

            {/* Action buttons */}
            <div className="flex items-center justify-between border-t border-bark pt-5 mt-2">
              <button
                type="button"
                onClick={() => setShowPasswordForm((shown) => !shown)}
                className="text-sm font-semibold hover:underline transition"
              >
                Change password
              </button>
              <button
                type="submit"
                className="bg-bark text-cream font-medium text-sm px-5 py-2.5 rounded-lg shadow-sm transition"
              >
                Save changes
              </button>
            </div>
          </form>

          {/* Password form, separate from the form above (different fields, different endpoint) */}
          {showPasswordForm && (
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
          )}
        </section>

        {/* RIGHT COLUMN: Families and invitations */}
        <div className="flex flex-col gap-6">

          {/* SECTION: My Families */}
          <section className="rounded-2xl border border-bark p-6 shadow-sm flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold">My Families</h2>
              <p className="text-xs">Families you are currently a member of.</p>
            </div>

            <ul className="flex flex-col gap-3">
              {families.map((family) => (
                <li
                  key={family.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-bark"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-bark text-cream flex items-center justify-center font-bold text-sm">
                      {family.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{family.name}</p>
                      <span className="inline-block bg-bark text-cream text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5">
                        {family.isOwner ? "Owner" : family.role}
                      </span>
                    </div>
                  </div>
                  {family.isOwner && (
                    <button
                      type="button"
                      className="text-xs border border-bark font-medium px-3 py-1.5 rounded-lg transition"
                    >
                      Manage
                    </button>
                  )}
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="w-full mt-2 py-2.5 border border-dashed border-bark rounded-lg text-sm font-medium transition"
            >
              + Create new family
            </button>
          </section>

          {/* SECTION: Pending Invitations */}
          <section className="rounded-2xl border border-bark p-6 shadow-sm flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold">Pending Invitations</h2>
              <p className="text-xs">Other families invited you to join them.</p>
            </div>

            <div className="p-4 border border-bark rounded-xl flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-bark text-cream flex items-center justify-center font-bold text-sm">
                  WF
                </div>
                <div>
                  <p className="text-sm font-semibold">White Family</p>
                  <p className="text-xs">Invited you as <span className="font-semibold">Member</span></p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  className="w-full bg-bark text-cream text-xs font-semibold py-2 rounded-lg transition"
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="w-full border border-bark text-xs font-semibold py-2 rounded-lg transition"
                >
                  Decline
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
