"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updatePersonSchema, type UpdatePersonInput } from "@myfamily/shared";

export type TreePersonDetails = {
  id: string;
  firstName: string;
  lastName: string;
  maidenName: string | null;
  birthDate: Date | null;
  birthPlace: string | null;
  deathDate: Date | null;
  deathPlace: string | null;
  occupation: string | null;
  bio: string | null;
  avatarBase64: string | null;
  userId: string | null;
  createdById: string;
};

function initials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

function toDateInput(value: Date | null) {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
}

export function PersonProfilePanel({
  familyId,
  person,
  currentUserId,
}: {
  familyId: string;
  person: TreePersonDetails;
  currentUserId: string;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [avatar, setAvatar] = useState<string | null>(person.avatarBase64);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePersonInput>({
    resolver: zodResolver(updatePersonSchema),
    defaultValues: {
      firstName: person.firstName,
      lastName: person.lastName,
      maidenName: person.maidenName ?? undefined,
      birthDate: toDateInput(person.birthDate) || undefined,
      birthPlace: person.birthPlace ?? undefined,
      deathDate: toDateInput(person.deathDate) || undefined,
      deathPlace: person.deathPlace ?? undefined,
      occupation: person.occupation ?? undefined,
      bio: person.bio ?? undefined,
    },
  });

  const canEdit = person.createdById === currentUserId;

  function onAvatarSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function onSubmit(data: UpdatePersonInput) {
    setSaveError("");

    const response = await fetch(`/api/family/${familyId}/tree/persons/${person.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, avatarBase64: avatar }),
    });

    if (!response.ok) {
      const body = await response.json();
      setSaveError(body.error ?? "Could not save changes.");
      return;
    }

    setIsEditing(false);
    router.refresh();
  }

  if (isEditing) {
    return (
      <form
        className="flex flex-col gap-2 p-4 rounded-xl border border-bark"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 shrink-0 rounded-full bg-bark text-cream overflow-hidden flex items-center justify-center font-bold">
            {avatar ? (
              <img src={avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              initials(person.firstName, person.lastName)
            )}
          </div>
          <div>
            <button
              type="button"
              className="text-xs font-semibold"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload photo
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <label className="text-xs">
            First name
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-bark p-2 text-sm focus:outline-none transition"
              {...register("firstName")}
            />
            {errors.firstName && <span className="text-xs">{errors.firstName.message}</span>}
          </label>
          <label className="text-xs">
            Last name
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-bark p-2 text-sm focus:outline-none transition"
              {...register("lastName")}
            />
            {errors.lastName && <span className="text-xs">{errors.lastName.message}</span>}
          </label>
          <label className="text-xs">
            Maiden name (optional)
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-bark p-2 text-sm focus:outline-none transition"
              {...register("maidenName")}
            />
          </label>
          <label className="text-xs">
            Occupation (optional)
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-bark p-2 text-sm focus:outline-none transition"
              {...register("occupation")}
            />
          </label>
          <label className="text-xs">
            Birth date (optional)
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-bark p-2 text-sm focus:outline-none transition"
              {...register("birthDate")}
            />
          </label>
          <label className="text-xs">
            Birth place (optional)
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-bark p-2 text-sm focus:outline-none transition"
              {...register("birthPlace")}
            />
          </label>
          <label className="text-xs">
            Death date (optional)
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-bark p-2 text-sm focus:outline-none transition"
              {...register("deathDate")}
            />
          </label>
          <label className="text-xs">
            Death place (optional)
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-bark p-2 text-sm focus:outline-none transition"
              {...register("deathPlace")}
            />
          </label>
        </div>

        <label className="text-xs">
          Bio (optional)
          <textarea
            rows={3}
            className="mt-1 w-full rounded-lg border border-bark p-2 text-sm focus:outline-none transition"
            {...register("bio")}
          />
          {errors.bio && <span className="text-xs">{errors.bio.message}</span>}
        </label>

        {saveError && <span className="text-xs">{saveError}</span>}

        <div className="flex gap-2 mt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="self-start bg-bark text-cream font-medium text-xs px-3 py-2 rounded-lg shadow-sm transition disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="self-start border border-bark text-xs px-3 py-2 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-bark">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 shrink-0 rounded-full bg-bark text-cream overflow-hidden flex items-center justify-center font-bold">
          {person.avatarBase64 ? (
            <img src={person.avatarBase64} alt="" className="w-full h-full object-cover" />
          ) : (
            initials(person.firstName, person.lastName)
          )}
        </div>
        <div>
          <p className="text-sm font-semibold">
            {person.firstName} {person.lastName}
            {person.maidenName && <span className="opacity-60"> ({person.maidenName})</span>}
          </p>
          {person.occupation && <p className="text-xs opacity-70">{person.occupation}</p>}
        </div>
      </div>

      <div className="text-xs opacity-70 flex flex-col gap-0.5">
        {person.birthDate && (
          <p>
            Born {toDateInput(person.birthDate)}
            {person.birthPlace ? ` in ${person.birthPlace}` : ""}
          </p>
        )}
        {person.deathDate && (
          <p>
            Died {toDateInput(person.deathDate)}
            {person.deathPlace ? ` in ${person.deathPlace}` : ""}
          </p>
        )}
      </div>

      {person.bio && <p className="text-sm whitespace-pre-wrap">{person.bio}</p>}

      {canEdit && (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="self-start text-xs border border-bark font-medium px-3 py-1.5 rounded-lg transition"
        >
          Edit
        </button>
      )}
    </div>
  );
}
