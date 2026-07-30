import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, MemberStatus, FamilyRole, AlbumType } from "@myfamily/db";

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

  if (album.type === AlbumType.DEFAULT) {
    return NextResponse.json({ error: "The default album cannot be deleted" }, { status: 400 });
  }

  const isOwner = album.createdById === membership.id;
  const isModerator =
    membership.role === FamilyRole.PARENT || membership.role === FamilyRole.GUARDIAN;

  if (!isOwner && !isModerator) {
    return NextResponse.json({ error: "Not permitted" }, { status: 403 });
  }

  const defaultAlbum = await prisma.album.findFirst({
    where: { familyId, type: AlbumType.DEFAULT },
  });

  if (!defaultAlbum) {
    return NextResponse.json({ error: "Default album not found" }, { status: 500 });
  }

  await prisma.$transaction([
    prisma.mediaFile.updateMany({
      where: { albumId },
      data: { albumId: defaultAlbum.id },
    }),
    prisma.album.delete({ where: { id: albumId } }),
  ]);

  return NextResponse.json({ ok: true }, { status: 200 });
}
