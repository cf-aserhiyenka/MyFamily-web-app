"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, type UpdateProfileInput } from "@myfamily/shared";

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

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-12 text-slate-800">
      {/* Header with navigation */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition mb-3"
        >
          <span>←</span> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-slate-500 text-sm">Manage your personal information and family memberships.</p>
      </div>

      {/* Two-column grid on desktop */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: Personal data (spans 2 columns on large screens) */}
        <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col gap-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            <p className="text-xs text-slate-400">Update your personal details and how others see you.</p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Avatar section */}
            <div className="flex items-center gap-5 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="relative group w-20 h-20 rounded-full bg-slate-200 border-2 border-white shadow-md overflow-hidden flex items-center justify-center cursor-pointer">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-slate-500">{initials}</span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <span className="text-[10px] text-white font-medium text-center px-1">Change</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium">Profile Photo</h4>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB. Recommended: 250x250px</p>
                <button type="button" className="text-xs text-blue-600 font-semibold hover:underline mt-2">
                  Upload new image
                </button>
              </div>
            </div>

            {/* Form fields in a 2x2 grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-600">
                First name
                <input
                  type="text"
                  className="rounded-lg border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <span className="text-xs text-red-600">{errors.firstName.message}</span>
                )}
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-600">
                Last name
                <input
                  type="text"
                  className="rounded-lg border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <span className="text-xs text-red-600">{errors.lastName.message}</span>
                )}
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-600 md:col-span-2">
                Email Address
                <input
                  type="email"
                  className="rounded-lg border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  defaultValue={email}
                  disabled
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-600 md:col-span-2">
                Birth date
                <input
                  type="date"
                  className="rounded-lg border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  {...register("birthDate")}
                />
              </label>
            </div>

            {saveError && <p className="text-sm text-red-600">{saveError}</p>}

            {/* Action buttons */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-2">
              <button
                type="button"
                className="text-sm font-semibold text-slate-600 hover:text-slate-800 transition"
              >
                Change password
              </button>
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm px-5 py-2.5 rounded-lg shadow-sm transition"
              >
                Save changes
              </button>
            </div>
          </form>
        </section>

        {/* RIGHT COLUMN: Families and invitations */}
        <div className="flex flex-col gap-6">

          {/* SECTION: My Families */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold">My Families</h2>
              <p className="text-xs text-slate-400">Families you are currently a member of.</p>
            </div>

            <ul className="flex flex-col gap-3">
              {families.map((family) => (
                <li
                  key={family.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                      {family.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{family.name}</p>
                      <span className="inline-block bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5">
                        {family.isOwner ? "Owner" : family.role}
                      </span>
                    </div>
                  </div>
                  {family.isOwner && (
                    <button
                      type="button"
                      className="text-xs bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium px-3 py-1.5 rounded-lg transition"
                    >
                      Manage
                    </button>
                  )}
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="w-full mt-2 py-2.5 border border-dashed border-slate-300 hover:border-slate-400 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-800 transition"
            >
              + Create new family
            </button>
          </section>

          {/* SECTION: Pending Invitations */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold text-amber-600">Pending Invitations</h2>
              <p className="text-xs text-slate-400">Other families invited you to join them.</p>
            </div>

            <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                  WF
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">White Family</p>
                  <p className="text-xs text-slate-500">Invited you as <span className="font-semibold text-slate-700">Member</span></p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold py-2 rounded-lg transition"
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="w-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold py-2 rounded-lg transition"
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
