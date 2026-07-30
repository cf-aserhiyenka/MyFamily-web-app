import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, AlbumType, FamilyRole } from "@myfamily/db";
import { getViewUrl } from "@/lib/s3";
import { ArchiveClient } from "./ArchiveClient";

async function getOrCreateDefaultAlbum(familyId: string) {
  const existing = await prisma.album.findFirst({
    where: { familyId: familyId , type: AlbumType.DEFAULT },
  });

  if (existing) {
    return existing;
  }

  return prisma.album.create({
    data: { name: "Main Gallery", type: AlbumType.DEFAULT, familyId },
  });
}

export default async function ArchivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: familyId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const member = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: session.user.id, familyId } },
  });

  if (!member || member.status !== "ACTIVE") {
    notFound();
  }

  const defaultAlbum = await getOrCreateDefaultAlbum(familyId);

  const albums = await prisma.album.findMany({
    where: { familyId: familyId },
    include: { _count: { select: { files: true } } },
    orderBy: { createdAt: "asc" },
  });


  const albumRows = await Promise.all(
    albums.map(async (album) => ({
      id: album.id,
      name: album.name,
      type: album.type,
      fileCount: album._count.files,
      canDelete:
        album.type === AlbumType.CUSTOM && 
        (album.createdById === member.id || member.role === FamilyRole.PARENT || member.role === FamilyRole.GUARDIAN),
    }))
  );

  const files = await prisma.mediaFile.findMany({
    where: { familyId, albumId: defaultAlbum.id },
    orderBy: { uploadedAt: "desc" },
  });

  const fileRows = await Promise.all(
    files.map(async (file) => ({
      id: file.id,
      albumId: file.albumId,
      originalName: file.originalName,
      url: await getViewUrl(file.storageKey),
      canDelete:
        file.uploadedById === member.id ||
        member.role === FamilyRole.PARENT ||
        member.role === FamilyRole.GUARDIAN,
    }))
  );

  return (
    <ArchiveClient
      familyId={familyId}
      albums={albumRows}
      initialAlbumId={defaultAlbum.id}
      initialFiles={fileRows}
    />
  );
}
