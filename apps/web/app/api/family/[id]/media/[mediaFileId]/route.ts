import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, MemberStatus, FamilyRole } from "@myfamily/db";
import { deleteMediaObject } from "@/lib/s3";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; mediaFileId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: familyId, mediaFileId } = await params;

  const membership = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: session.user.id, familyId } },
  });

  if (!membership || membership.status !== MemberStatus.ACTIVE) {
    return NextResponse.json({ error: "You are not a member of this family" }, { status: 403 });
  }

  const mediaFile = await prisma.mediaFile.findUnique({ where: { id: mediaFileId } });

  if (!mediaFile || mediaFile.familyId !== familyId) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const isOwner = mediaFile.uploadedById === membership.id;
  const isModerator =
    membership.role === FamilyRole.PARENT || membership.role === FamilyRole.GUARDIAN;

  if (!isOwner && !isModerator) {
    return NextResponse.json({ error: "Not permitted" }, { status: 403 });
  }

  await prisma.mediaFile.delete({ where: { id: mediaFileId } });

  try {
    await deleteMediaObject(mediaFile.storageKey);
  } catch (error) {
    console.error("Failed to delete media object from storage", error);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
