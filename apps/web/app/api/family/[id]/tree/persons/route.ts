import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@myfamily/db";
import { createPersonSchema } from "@myfamily/shared";
import { getFamilyContext } from "@/lib/permissions";
import { resolveRelationDirection } from "@/lib/personRelations";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: familyId } = await params;

  const body = await request.json();
  const parsed = createPersonSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid person data" }, { status: 400 });
  }

  const context = await getFamilyContext(session.user.id, familyId);

  if (!context?.isActiveMember || !context.membership) {
    return NextResponse.json({ error: "You are not a member of this family" }, { status: 403 });
  }

  if (!context.permissions?.manageTree) {
    return NextResponse.json(
      { error: "Only parents or guardians can manage the family tree" },
      { status: 403 }
    );
  }

  const {
    firstName,
    lastName,
    maidenName,
    birthDate,
    birthPlace,
    deathDate,
    deathPlace,
    occupation,
    bio,
    avatarBase64,
    relatedPersonId,
    relationToPerson,
  } = parsed.data;
  const membership = context.membership;

  if (relatedPersonId) {
    const relatedMembership = await prisma.familyTreeMembership.findUnique({
      where: { personId_familyId: { personId: relatedPersonId, familyId } },
    });
    if (!relatedMembership) {
      return NextResponse.json(
        { error: "The person you want to relate to is not in this family's tree" },
        { status: 400 }
      );
    }
  }

  const person = await prisma.$transaction(async (tx) => {
    const created = await tx.personNode.create({
      data: {
        firstName,
        lastName,
        maidenName: maidenName || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        birthPlace: birthPlace || null,
        deathDate: deathDate ? new Date(deathDate) : null,
        deathPlace: deathPlace || null,
        occupation: occupation || null,
        bio: bio || null,
        avatarBase64: avatarBase64 || null,
        createdById: session.user.id,
      },
    });

    await tx.familyTreeMembership.create({
      data: { personId: created.id, familyId, addedById: membership.id },
    });

    if (relatedPersonId && relationToPerson) {
      const { relation, personAId, personBId } = resolveRelationDirection(
        relationToPerson,
        created.id,
        relatedPersonId
      );
      await tx.personRelation.create({
        data: { familyId, personAId, personBId, relation, createdById: session.user.id },
      });
    }

    return created;
  });

  return NextResponse.json({ id: person.id }, { status: 201 });
}
