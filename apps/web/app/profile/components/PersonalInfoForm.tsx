"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, type UpdateProfileInput } from "@myfamily/shared";
import { ChangePasswordForm } from "./ChangePasswordForm";

type PersonalInfoFormProps = {
  email: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  avatarBase64: string | null;
};

export function PersonalInfoForm({
  email,
  firstName,
  lastName,
  birthDate,
  avatarBase64,
}: PersonalInfoFormProps) {

  const [avatar, setAvatar] = useState<string | null>(avatarBase64);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      body: JSON.stringify({ ...data, avatarBase64: avatar }),
    });

    if (!response.ok) {
      setSaveError("Could not save changes.");
      return;
    }

    router.refresh();
  }

  function onAvatarSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  async function onDeleteAccount() {
    const confirmed = window.confirm(
      "This will permanently deactivate your account. Are you sure?"
    );
    if (!confirmed) return;

    setDeleteError("");
    setIsDeleting(true);

    const response = await fetch("/api/profile", { method: "DELETE" });

    if (!response.ok) {
      const body = await response.json();
      setDeleteError(body.error ?? "Could not delete account.");
      setIsDeleting(false);
      return;
    }

    await signOut({ callbackUrl: "/login" });
  }

  return (
    <section className="lg:col-span-2 rounded-2xl border border-bark p-6 shadow-sm flex flex-col gap-6">
      <div className="border-b border-bark pb-4">
        <h2 className="text-xl font-semibold">Personal Information</h2>
        <p className="text-xs">Update your personal details and how others see you.</p>
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>

        <div className="flex items-center gap-5 p-4 rounded-xl border border-bark">
          <div className="w-20 h-20 rounded-full bg-bark border-2 border-cream shadow-md overflow-hidden flex items-center justify-center">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-cream">{initials}</span>
            )}
          </div>
          <div>
            <h4 className="text-sm font-medium">Profile Photo</h4>
            <p className="text-xs mt-1">PNG, JPG up to 5MB. Recommended: 250x250px</p>
            <button
              type="button"
              className="text-xs font-semibold mt-2"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload new image
            </button>
            <input
              type="file"
              accept="image/png, image/jpeg"
              ref={fileInputRef}
              onChange={onAvatarSelected}
              className="hidden"
            />
          </div>
        </div>

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

        <div className="flex items-center border-t border-bark pt-5 mt-2">
          <button
            type="submit"
            className="bg-bark text-cream font-medium text-sm px-5 py-2.5 rounded-lg shadow-sm transition"
          >
            Save changes
          </button>
        </div>
      </form>

      <div className="flex items-center justify-end border-t border-bark pt-5 mt-2">
        <button
          type="button"
          onClick={() => setShowPasswordForm((shown) => !shown)}
          className="text-cream font-medium text-sm px-5 py-2.5 rounded-lg shadow-sm transition bg-bark"
        >
          Change password
        </button>
      </div>
      {showPasswordForm && <ChangePasswordForm />}
      <div className="flex items-center justify-between border-t border-bark pt-5 mt-2">
        <div>
          <p className="text-sm font-semibold">Delete account</p>
          {deleteError && <p className="text-xs">{deleteError}</p>}
        </div>
        <button
          type="button"
          disabled={isDeleting}
          onClick={onDeleteAccount}
          className="text-cream font-medium text-sm px-5 py-2.5 rounded-lg shadow-sm transition bg-red-600 hover:bg-red-800 disabled:opacity-50"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </section>
  );
}
