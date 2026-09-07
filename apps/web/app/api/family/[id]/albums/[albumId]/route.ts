import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, MemberStatus, FamilyRole } from "@myfamily/db";
import { deleteMediaObject } from "@/lib/s3";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; albumId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: familyId, albumId } = await params;

  const membership = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: session.user.id, familyId } },
  });

  if (!membership || membership.status !== MemberStatus.ACTIVE) {
    return NextResponse.json({ error: "You are not a member of this family" }, { status: 403 });
  }

  const album = await prisma.album.findUnique({ where: { id: albumId } });

  if (!album || album.familyId !== familyId) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  const isOwner = album.createdById === membership.id;
  const isModerator =
    membership.role === FamilyRole.PARENT || membership.role === FamilyRole.GUARDIAN;

  if (!isOwner && !isModerator) {
    return NextResponse.json({ error: "Not permitted" }, { status: 403 });
  }

  const files = await prisma.mediaFile.findMany({ where: { albumId } });

  await prisma.$transaction([
    prisma.mediaFile.deleteMany({ where: { albumId } }),
    prisma.album.delete({ where: { id: albumId } }),
  ]);

  await Promise.all(
    files.map(async (file) => {
      try {
        await deleteMediaObject(file.storageKey);
      } catch (error) {
        console.error("Failed to delete media object from storage", error);
      }
    })
  );

  return NextResponse.json({ ok: true }, { status: 200 });
}
