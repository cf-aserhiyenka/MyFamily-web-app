import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, FamilyRole, MemberStatus, ConversationType } from "@myfamily/db";
import { createFamilySchema } from "@myfamily/shared";
import { isAtLeast18 } from "@/lib/age";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createFamilySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid family data" }, { status: 400 });
  }

  const personNode = await prisma.personNode.findUnique({
    where: { userId: session.user.id },
  });

  // Never trust the client-side gate alone: a family always needs a real
  // person behind it, so require firstName/lastName/birthDate here too.
  if (!personNode?.firstName || !personNode?.lastName || !personNode?.birthDate) {
    return NextResponse.json(
      { error: "Please complete your profile (first name, last name, birth date) first." },
      { status: 400 }
    );
  }

  if (!isAtLeast18(personNode.birthDate)) {
    return NextResponse.json(
      { error: "You must be at least 18 years old to create a family." },
      { status: 400 }
    );
  }

  // Family + founding member + default group chat must all exist together
  // or not at all, so this whole block runs as one transaction.
  const family = await prisma.$transaction(async (tx) => {
    const createdFamily = await tx.family.create({
      data: {
        name: parsed.data.name,
        createdById: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            personNodeId: personNode.id,
            role: FamilyRole.PARENT,
            status: MemberStatus.ACTIVE,
          },
        },
      },
      include: { members: true },
    });

    const founderMember = createdFamily.members[0];

    await tx.conversation.create({
      data: {
        type: ConversationType.GROUP_DEFAULT,
        familyId: createdFamily.id,
        participants: {
          create: { memberId: founderMember.id },
        },
      },
    });

    return createdFamily;
  });

  return NextResponse.json({ id: family.id, name: family.name }, { status: 201 });
}
