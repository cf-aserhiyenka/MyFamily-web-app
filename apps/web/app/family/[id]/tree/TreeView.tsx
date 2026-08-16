"use client";

import { useState } from "react";
import type { PersonRelation } from "@myfamily/db";
import type { GenerationRow } from "@/lib/tree";

type TreePerson = {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: Date | null;
  deathDate: Date | null;
  userId: string | null;
};

function initials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

function personDates(person: TreePerson) {
  const born = person.birthDate?.getFullYear();
  const died = person.deathDate?.getFullYear();
  if (died) return `${born ?? "?"}–${died}`;
  if (born) return `b. ${born}`;
  return null;
}

function PersonCard({
  person,
  isYou,
  isHighlighted,
  onClick,
}: {
  person: TreePerson;
  isYou: boolean;
  isHighlighted: boolean;
  onClick: () => void;
}) {
  const dates = personDates(person);

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex flex-col items-center gap-1 px-3 py-2 text-center w-28 rounded-xl " +
        (isHighlighted ? "ring-2 ring-bark" : "")
      }
    >
      <div className="w-12 h-12 rounded-full bg-bark text-cream flex items-center justify-center font-bold text-sm">
        {initials(person.firstName, person.lastName)}
      </div>
      <p className="text-sm font-semibold leading-tight">
        {person.firstName} {person.lastName} {isYou && "(you)"}
      </p>
      {dates && <p className="text-xs opacity-60">{dates}</p>}
    </button>
  );
}

export function TreeView({
  generations,
  relations,
  currentUserId,
}: {
  generations: GenerationRow[];
  relations: PersonRelation[];
  currentUserId: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const parentOf = relations.filter((r) => r.relation === "PARENT_OF");
  const parentIds = new Set(parentOf.filter((r) => r.personBId === selectedId).map((r) => r.personAId));
  const childIds = new Set(parentOf.filter((r) => r.personAId === selectedId).map((r) => r.personBId));

  function isHighlighted(personId: string) {
    if (!selectedId) return false;
    return personId === selectedId || parentIds.has(personId) || childIds.has(personId);
  }

  function handleClick(personId: string) {
    setSelectedId((current) => (current === personId ? null : personId));
  }

  const isEmpty = generations.every((row) => row.groups.length === 0);

  if (generations.length === 0 || isEmpty) {
    return <p className="text-sm opacity-70">There are no people in this family&apos;s tree yet.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {generations.map((row, i) => (
        <div
          key={row.generation}
          className={"flex flex-wrap justify-center gap-6 " + (i > 0 ? "pt-6 border-t border-dashed border-bark/20" : "")}
        >
          {row.groups.map((group, groupIndex) =>
            group.length > 1 ? (
              <div key={groupIndex} className="flex items-stretch border-2 border-bark rounded-2xl overflow-hidden">
                {group.map((person, j) => (
                  <div key={person.id} className={j > 0 ? "border-l border-bark/20" : ""}>
                    <PersonCard
                      person={person}
                      isYou={person.userId === currentUserId}
                      isHighlighted={isHighlighted(person.id)}
                      onClick={() => handleClick(person.id)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div key={group[0].id} className="border border-bark rounded-2xl">
                <PersonCard
                  person={group[0]}
                  isYou={group[0].userId === currentUserId}
                  isHighlighted={isHighlighted(group[0].id)}
                  onClick={() => handleClick(group[0].id)}
                />
              </div>
            )
          )}
        </div>
      ))}
    </div>
  );
}
