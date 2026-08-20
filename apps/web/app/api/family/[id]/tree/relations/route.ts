import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, MemberStatus, RelationType } from "@myfamily/db";
import { createRelationSchema } from "@myfamily/shared";

async function isAncestor(familyId: string, candidateId: string, personId: string) {
  const parentRelations = await prisma.personRelation.findMany({
    where: { familyId, relation: RelationType.PARENT_OF },
    select: { personAId: true, personBId: true },
  });

  const visited = new Set<string>();
  let queue = [personId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === candidateId) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    const parents = parentRelations.filter((r) => r.personBId === current).map((r) => r.personAId);
    queue.push(...parents);
  }

  return false;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: familyId } = await params;

  const body = await request.json();
  const parsed = createRelationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid relation data" }, { status: 400 });
  }

  const membership = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: session.user.id, familyId } },
  });

  if (!membership || membership.status !== MemberStatus.ACTIVE) {
    return NextResponse.json({ error: "You are not a member of this family" }, { status: 403 });
  }

  const { personAId, personBId, relation } = parsed.data;

  const treeMemberships = await prisma.familyTreeMembership.findMany({
    where: { familyId, personId: { in: [personAId, personBId] } },
  });

  if (treeMemberships.length !== 2) {
    return NextResponse.json({ error: "Both people must be in this family's tree" }, { status: 400 });
  }

  const existingBetweenPair = await prisma.personRelation.findMany({
    where: {
      familyId,
      OR: [
        { personAId, personBId },
        { personAId: personBId, personBId: personAId },
      ],
    },
  });

  if (existingBetweenPair.some((r) => r.relation !== relation)) {
    return NextResponse.json({ error: "These people already have a conflicting relation" }, { status: 409 });
  }

  if (relation === RelationType.PARENT_OF) {
    const parentCount = await prisma.personRelation.count({
      where: { familyId, relation: RelationType.PARENT_OF, personBId },
    });
    if (parentCount >= 2) {
      return NextResponse.json({ error: "This person already has 2 parents" }, { status: 400 });
    }

    const wouldCycle = await isAncestor(familyId, personBId, personAId);
    if (wouldCycle) {
      return NextResponse.json({ error: "This relation would create a cycle" }, { status: 400 });
    }
  }

  try {
    const created = await prisma.personRelation.create({
      data: { familyId, personAId, personBId, relation, createdById: session.user.id },
    });
    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "This relation already exists" }, { status: 409 });
    }
    throw error;
  }
}
