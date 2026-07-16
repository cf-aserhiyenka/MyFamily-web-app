import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@myfamily/db";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const invitation = await prisma.familyInvitation.findUnique({ where: { id } });

  if (
    !invitation ||
    invitation.email !== session.user.email ||
    invitation.usedAt ||
    invitation.declinedAt
  ) {
    return NextResponse.json({ error: "This invitation is no longer valid" }, { status: 400 });
  }

  await prisma.familyInvitation.update({
    where: { id: invitation.id },
    data: { declinedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
