"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updatePersonSchema, type UpdatePersonInput, type RelationDirection } from "@myfamily/shared";
import type { PersonRelation } from "@myfamily/db";
import {
  relationDirectionLabels,
  resolveRelationDirection,
  describeRelationForSubject,
} from "@/lib/personRelations";

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
  persons,
  relations,
  canManageRelations,
}: {
  familyId: string;
  person: TreePersonDetails;
  currentUserId: string;
  persons: { id: string; firstName: string; lastName: string }[];
  relations: PersonRelation[];
  canManageRelations: boolean;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [avatar, setAvatar] = useState<string | null>(person.avatarBase64);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [relationError, setRelationError] = useState("");
  const [isAddingRelation, setIsAddingRelation] = useState(false);
  const [newRelationDirection, setNewRelationDirection] = useState<RelationDirection | "">("");
  const [newRelationPersonId, setNewRelationPersonId] = useState("");

  const personRelations = relations.filter(
    (r) => r.personAId === person.id || r.personBId === person.id
  );

  function otherPersonName(otherId: string) {
    const other = persons.find((p) => p.id === otherId);
    return other ? `${other.firstName} ${other.lastName}` : "Unknown";
  }

  const relationCandidates = persons.filter(
    (p) => p.id !== person.id && !personRelations.some((r) => r.personAId === p.id || r.personBId === p.id)
  );

  async function onAddRelation() {
    if (!newRelationDirection || !newRelationPersonId) return;
    setRelationError("");

    const { relation, personAId, personBId } = resolveRelationDirection(
      newRelationDirection,
      person.id,
      newRelationPersonId
    );

    const response = await fetch(`/api/family/${familyId}/tree/relations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personAId, personBId, relation }),
    });

    if (!response.ok) {
      const body = await response.json();
      setRelationError(body.error ?? "Could not add this relation.");
      return;
    }

    setNewRelationDirection("");
    setNewRelationPersonId("");
    setIsAddingRelation(false);
    router.refresh();
  }

  async function onRemoveRelation(relationId: string) {
    setRelationError("");

    const response = await fetch(`/api/family/${familyId}/tree/relations/${relationId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const body = await response.json();
      setRelationError(body.error ?? "Could not remove this relation.");
      return;
    }

    router.refresh();
  }

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

  async function onDelete() {
    const ok = confirm(
      `Delete ${person.firstName} ${person.lastName} from the family tree? This also removes their relations. This cannot be undone.`
    );
    if (!ok) return;

    setSaveError("");

    const response = await fetch(`/api/family/${familyId}/tree/persons/${person.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const body = await response.json();
      setSaveError(body.error ?? "Could not delete this person.");
      return;
    }

    setIsEditing(false);
    router.refresh();
  }

  const canDelete = canEdit && !person.userId;

  const relationsSection = (
    <div className="flex flex-col gap-2 pt-2 border-t border-bark/20">
      <p className="text-xs font-semibold">Relations</p>
      {personRelations.length === 0 && <p className="text-xs opacity-60">No relations yet.</p>}
      {personRelations.map((r) => {
        const isSubjectPersonA = r.personAId === person.id;
        const otherId = isSubjectPersonA ? r.personBId : r.personAId;
        return (
          <div key={r.id} className="flex items-center justify-between gap-2 text-xs">
            <span>
              {describeRelationForSubject(r.relation, isSubjectPersonA)} {otherPersonName(otherId)}
            </span>
            {canManageRelations && (
              <button
                type="button"
                onClick={() => onRemoveRelation(r.id)}
                className="opacity-60 hover:opacity-100"
              >
                Remove
              </button>
            )}
          </div>
        );
      })}

      {canManageRelations && relationCandidates.length > 0 && (
        isAddingRelation ? (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <select
                className="rounded-lg border border-bark p-2 text-xs focus:outline-none transition"
                value={newRelationDirection}
                onChange={(e) => setNewRelationDirection(e.target.value as RelationDirection | "")}
              >
                <option value="">Select relation</option>
                {Object.entries(relationDirectionLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                className="rounded-lg border border-bark p-2 text-xs focus:outline-none transition"
                value={newRelationPersonId}
                onChange={(e) => setNewRelationPersonId(e.target.value)}
              >
                <option value="">Select person</option>
                {relationCandidates.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName}
                  </option>
                ))}
              </select>
            </div>
            {relationError && <span className="text-xs">{relationError}</span>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onAddRelation}
                disabled={!newRelationDirection || !newRelationPersonId}
                className="self-start text-xs border border-bark font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-50"
              >
                Add relation
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingRelation(false);
                  setRelationError("");
                }}
                className="self-start text-xs px-3 py-1.5 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAddingRelation(true)}
            className="self-start text-xs border border-bark font-medium px-3 py-1.5 rounded-lg transition"
          >
            + Add relation
          </button>
        )
      )}
    </div>
  );

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

        {relationsSection}

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
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="self-start text-xs px-3 py-2 rounded-lg transition opacity-70 hover:opacity-100"
            >
              Delete person
            </button>
          )}
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

      {relationsSection}

      {saveError && <span className="text-xs">{saveError}</span>}

      {canEdit && (
        <div className="flex gap-2">
          {canEdit && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="self-start text-xs border border-bark font-medium px-3 py-1.5 rounded-lg transition"
            >
              Edit
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="self-start text-xs px-3 py-1.5 rounded-lg transition opacity-70 hover:opacity-100"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
