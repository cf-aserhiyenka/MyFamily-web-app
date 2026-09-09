import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@myfamily/db";
import { updatePersonSchema } from "@myfamily/shared";
import { getFamilyContext, canEditPersonNode } from "@/lib/permissions";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; personId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: familyId, personId } = await params;

  const body = await request.json();
  const parsed = updatePersonSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid person data" }, { status: 400 });
  }

  const context = await getFamilyContext(session.user.id, familyId);
  if (!context?.isActiveMember || !context.membership) {
    return NextResponse.json({ error: "You are not a member of this family" }, { status: 403 });
  }

  const membership = await prisma.familyTreeMembership.findUnique({
    where: { personId_familyId: { personId, familyId } },
    include: { person: true },
  });
  if (!membership) {
    return NextResponse.json({ error: "Person not found in this family's tree" }, { status: 404 });
  }

  if (!canEditPersonNode(session.user.id, membership.person)) {
    return NextResponse.json(
      { error: "Only the person who added this profile can edit it" },
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
  } = parsed.data;

  await prisma.personNode.update({
    where: { id: personId },
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
      avatarBase64,
    },
  });

  return NextResponse.json({ ok: true });
}
