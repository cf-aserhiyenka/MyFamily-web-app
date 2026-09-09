import type { RelationDirection } from "@myfamily/shared";

export const relationDirectionLabels: Record<RelationDirection, string> = {
  CHILD_OF: "is child of",
  PARENT_OF: "is parent of",
  PARTNER_OF: "is partner of",
  SIBLING_OF: "is sibling of",
};

export function resolveRelationDirection(
  direction: RelationDirection,
  subjectId: string,
  otherId: string
): { relation: "PARENT_OF" | "PARTNER_OF" | "SIBLING_OF"; personAId: string; personBId: string } {
  switch (direction) {
    case "CHILD_OF":
      return { relation: "PARENT_OF", personAId: otherId, personBId: subjectId };
    case "PARENT_OF":
      return { relation: "PARENT_OF", personAId: subjectId, personBId: otherId };
    case "PARTNER_OF":
      return { relation: "PARTNER_OF", personAId: subjectId, personBId: otherId };
    case "SIBLING_OF":
      return { relation: "SIBLING_OF", personAId: subjectId, personBId: otherId };
  }
}

export function describeRelationForSubject(
  relation: "PARENT_OF" | "PARTNER_OF" | "SIBLING_OF",
  isSubjectPersonA: boolean
): string {
  if (relation === "PARENT_OF") return isSubjectPersonA ? "Parent of" : "Child of";
  if (relation === "PARTNER_OF") return "Partner of";
  return "Sibling of";
}
