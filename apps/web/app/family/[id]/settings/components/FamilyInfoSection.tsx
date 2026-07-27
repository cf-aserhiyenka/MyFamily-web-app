"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateFamilySchema, type UpdateFamilyInput } from "@myfamily/shared";

type FamilyInfoSectionProps = {
  familyId: string;
  family: {
    name: string;
    description: string;
    avatarBase64: string | null;
  };
  canManageFamily: boolean;
};

export function FamilyInfoSection({ familyId, family, canManageFamily }: FamilyInfoSectionProps) {
  const router = useRouter();
  const [saveError, setSaveError] = useState("");
  const initials = family.name.slice(0, 2).toUpperCase();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateFamilyInput>({
    resolver: zodResolver(updateFamilySchema),
    defaultValues: { name: family.name, description: family.description },
  });

  async function onSubmit(data: UpdateFamilyInput) {
    setSaveError("");

    const response = await fetch(`/api/family/${familyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const body = await response.json();
      setSaveError(body.error ?? "Could not save changes.");
      return;
    }

    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-bark p-6 shadow-sm flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Family Info</h2>
        <p className="text-xs">Name, description and avatar shown to all members.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-bark border-2 border-cream shadow-md overflow-hidden flex items-center justify-center">
          {family.avatarBase64 ? (
            <img src={family.avatarBase64} alt="Family avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-cream">{initials}</span>
          )}
        </div>
        {canManageFamily && (
          <button type="button" className="text-xs font-semibold">
            Upload new image
          </button>
        )}
      </div>

      <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Family name
          <input
            type="text"
            className="rounded-lg border border-bark p-2.5 focus:outline-none transition"
            disabled={!canManageFamily}
            {...register("name")}
          />
          {errors.name && <span className="text-xs">{errors.name.message}</span>}
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Description
          <textarea
            rows={3}
            className="rounded-lg border border-bark p-2.5 focus:outline-none transition"
            disabled={!canManageFamily}
            {...register("description")}
          />
          {errors.description && <span className="text-xs">{errors.description.message}</span>}
        </label>

        {saveError && <span className="text-xs">{saveError}</span>}

        {canManageFamily && (
          <button
            type="submit"
            disabled={isSubmitting}
            className="self-start bg-bark text-cream font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition"
          >
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>
        )}
      </form>
    </section>
  );
}
