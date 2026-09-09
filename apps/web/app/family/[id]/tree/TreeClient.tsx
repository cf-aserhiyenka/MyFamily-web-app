"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createPersonSchema,
  type CreatePersonInput,
  createRelationSchema,
  type CreateRelationInput,
} from "@myfamily/shared";
import type { PersonRelation } from "@myfamily/db";
import type { GenerationRow } from "@/lib/tree";
import { TreeView } from "./TreeView";

type TreeClientProps = {
  familyId: string;
  currentUserId: string;
  persons: { id: string; firstName: string; lastName: string }[];
  relations: PersonRelation[];
  generations: GenerationRow[];
};

const relationLabels: Record<CreateRelationInput["relation"], string> = {
  PARENT_OF: "is parent of",
  PARTNER_OF: "is partner of",
  SIBLING_OF: "is sibling of",
};

export function TreeClient({ familyId, currentUserId, persons, relations, generations }: TreeClientProps) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [addError, setAddError] = useState("");
  const [showRelationForm, setShowRelationForm] = useState(false);
  const [relationError, setRelationError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreatePersonInput>({
    resolver: zodResolver(createPersonSchema),
  });

  const {
    register: registerRelation,
    handleSubmit: handleSubmitRelation,
    reset: resetRelation,
    formState: { errors: relationErrors, isSubmitting: isSubmittingRelation },
  } = useForm<CreateRelationInput>({
    resolver: zodResolver(createRelationSchema),
  });

  async function onSubmit(data: CreatePersonInput) {
    setAddError("");

    const response = await fetch(`/api/family/${familyId}/tree/persons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const body = await response.json();
      setAddError(body.error ?? "Could not add this person.");
      return;
    }

    reset();
    setShowAddForm(false);
    router.refresh();
  }

  async function onSubmitRelation(data: CreateRelationInput) {
    setRelationError("");

    const response = await fetch(`/api/family/${familyId}/tree/relations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const body = await response.json();
      setRelationError(body.error ?? "Could not add this relation.");
      return;
    }

    resetRelation();
    setShowRelationForm(false);
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-bark p-6 shadow-sm flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Family tree</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowAddForm((shown) => !shown)}
            className="text-xs border border-bark font-medium px-3 py-1.5 rounded-lg transition"
          >
            Add person
          </button>
          <button
            type="button"
            onClick={() => setShowRelationForm((shown) => !shown)}
            className="text-xs border border-bark font-medium px-3 py-1.5 rounded-lg transition"
            disabled={persons.length < 2}
          >
            Add relation
          </button>
        </div>
      </div>

      {showAddForm && (
        <form className="flex flex-col gap-2 p-3 rounded-xl border border-bark" onSubmit={handleSubmit(onSubmit)}>
          <input
            type="text"
            placeholder="First name"
            className="rounded-lg border border-bark p-2 text-sm focus:outline-none transition"
            {...register("firstName")}
          />
          {errors.firstName && <span className="text-xs">{errors.firstName.message}</span>}

          <input
            type="text"
            placeholder="Last name"
            className="rounded-lg border border-bark p-2 text-sm focus:outline-none transition"
            {...register("lastName")}
          />
          {errors.lastName && <span className="text-xs">{errors.lastName.message}</span>}

          <label className="text-xs">
            Birth date (optional)
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-bark p-2 text-sm focus:outline-none transition"
              {...register("birthDate")}
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
          {errors.deathDate && <span className="text-xs">{errors.deathDate.message}</span>}

          {addError && <span className="text-xs">{addError}</span>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="self-start bg-bark text-cream font-medium text-xs px-3 py-2 rounded-lg shadow-sm transition"
          >
            {isSubmitting ? "Adding..." : "Add person"}
          </button>
        </form>
      )}

      {showRelationForm && (
        <form
          className="flex flex-col gap-2 p-3 rounded-xl border border-bark"
          onSubmit={handleSubmitRelation(onSubmitRelation)}
        >
          <label className="text-xs">
            Person A
            <select
              className="mt-1 w-full rounded-lg border border-bark p-2 text-sm focus:outline-none transition"
              {...registerRelation("personAId")}
            >
              <option value="">Select person</option>
              {persons.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.firstName} {person.lastName}
                </option>
              ))}
            </select>
          </label>
          {relationErrors.personAId && <span className="text-xs">{relationErrors.personAId.message}</span>}

          <label className="text-xs">
            Relation
            <select
              className="mt-1 w-full rounded-lg border border-bark p-2 text-sm focus:outline-none transition"
              {...registerRelation("relation")}
            >
              {Object.entries(relationLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs">
            Person B
            <select
              className="mt-1 w-full rounded-lg border border-bark p-2 text-sm focus:outline-none transition"
              {...registerRelation("personBId")}
            >
              <option value="">Select person</option>
              {persons.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.firstName} {person.lastName}
                </option>
              ))}
            </select>
          </label>
          {relationErrors.personBId && <span className="text-xs">{relationErrors.personBId.message}</span>}

          <p className="text-xs opacity-60">
            For &quot;is parent of&quot;, person A is the parent and person B is the child.
          </p>

          {relationError && <span className="text-xs">{relationError}</span>}

          <button
            type="submit"
            disabled={isSubmittingRelation}
            className="self-start bg-bark text-cream font-medium text-xs px-3 py-2 rounded-lg shadow-sm transition"
          >
            {isSubmittingRelation ? "Adding..." : "Add relation"}
          </button>
        </form>
      )}

      <TreeView
        familyId={familyId}
        generations={generations}
        relations={relations}
        currentUserId={currentUserId}
      />
    </section>
  );
}
