import { prisma, MemberStatus, RelationType, type PersonNode, type PersonRelation } from "@myfamily/db";

export type GenerationRow = {
  generation: number;
  groups: PersonNode[][];
};

async function ensureFamilyMembersInTree(familyId: string) {
  const members = await prisma.familyMember.findMany({
    where: { familyId, status: MemberStatus.ACTIVE },
    select: { id: true, personNodeId: true },
  });

  const existing = await prisma.familyTreeMembership.findMany({
    where: { familyId, personId: { in: members.map((m) => m.personNodeId) } },
    select: { personId: true },
  });
  const existingIds = new Set(existing.map((m) => m.personId));

  const missing = members.filter((m) => !existingIds.has(m.personNodeId));
  if (missing.length === 0) return;

  await prisma.familyTreeMembership.createMany({
    data: missing.map((m) => ({ personId: m.personNodeId, familyId, addedById: m.id })),
  });
}

export async function getFamilyTreeData(
  familyId: string
): Promise<{ persons: PersonNode[]; relations: PersonRelation[] }> {
  await ensureFamilyMembersInTree(familyId);

  const [memberships, relations] = await Promise.all([
    prisma.familyTreeMembership.findMany({
      where: { familyId },
      include: { person: true },
    }),
    prisma.personRelation.findMany({ where: { familyId } }),
  ]);

  return { persons: memberships.map((m) => m.person), relations };
}

export function buildGenerations(persons: PersonNode[], relations: PersonRelation[]): GenerationRow[] {
  const parentOf = relations.filter((r) => r.relation === RelationType.PARENT_OF);
  const partnerOf = relations.filter((r) => r.relation === RelationType.PARTNER_OF);
  const siblingOf = relations.filter((r) => r.relation === RelationType.SIBLING_OF);

  const childIds = new Set(parentOf.map((r) => r.personBId));

  const hasAnyRelation = new Set<string>();
  for (const r of relations) {
    hasAnyRelation.add(r.personAId);
    hasAnyRelation.add(r.personBId);
  }
  const linkedToNonRoot = new Set<string>();
  for (const r of [...partnerOf, ...siblingOf]) {
    if (childIds.has(r.personBId)) linkedToNonRoot.add(r.personAId);
    if (childIds.has(r.personAId)) linkedToNonRoot.add(r.personBId);
  }

  const roots = persons.filter(
    (p) => !childIds.has(p.id) && !linkedToNonRoot.has(p.id) && hasAnyRelation.has(p.id)
  );

  const generationOf = new Map<string, number>();
  let currentLayer = roots.map((p) => p.id);
  let generation = 0;

  while (currentLayer.length > 0) {
    const nextLayer: string[] = [];
    for (const personId of currentLayer) {
      if (generationOf.has(personId)) continue; // już ustawione przez inną gałąź drzewa
      generationOf.set(personId, generation);
      for (const r of parentOf) {
        if (r.personAId === personId) nextLayer.push(r.personBId);
      }
    }
    currentLayer = nextLayer;
    generation++;
  }

  let changed = true;
  while (changed) {
    changed = false;
    for (const r of [...partnerOf, ...siblingOf]) {
      const generationA = generationOf.get(r.personAId);
      const generationB = generationOf.get(r.personBId);
      if (generationA !== undefined && generationB === undefined) {
        generationOf.set(r.personBId, generationA);
        changed = true;
      } else if (generationB !== undefined && generationA === undefined) {
        generationOf.set(r.personAId, generationB);
        changed = true;
      }
    }
  }

  const withoutGeneration = persons.filter((p) => !generationOf.has(p.id));

  const groupLeaderOf = new Map<string, string>();
  for (const r of partnerOf) {
    const leader = groupLeaderOf.get(r.personAId) ?? r.personAId;
    groupLeaderOf.set(r.personAId, leader);
    groupLeaderOf.set(r.personBId, leader);
  }

  const maxGeneration = Math.max(0, ...generationOf.values());
  const rows: GenerationRow[] = [];

  for (let g = 0; g <= maxGeneration; g++) {
    const peopleInRow = persons.filter((p) => generationOf.get(p.id) === g);
    const groups = new Map<string, PersonNode[]>();

    for (const person of peopleInRow) {
      const leader = groupLeaderOf.get(person.id) ?? person.id;
      if (!groups.has(leader)) groups.set(leader, []);
      groups.get(leader)!.push(person);
    }

    rows.push({ generation: g, groups: [...groups.values()] });
  }

  if (withoutGeneration.length > 0) {
    rows.push({ generation: maxGeneration + 1, groups: withoutGeneration.map((p) => [p]) });
  }

  return rows;
}
