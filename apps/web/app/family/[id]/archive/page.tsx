import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, FamilyRole } from "@myfamily/db";
import { getViewUrl } from "@/lib/s3";
import { ArchiveClient } from "./ArchiveClient";

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

  const albums = await prisma.album.findMany({
    where: { familyId: familyId },
    include: { _count: { select: { files: true } } },
    orderBy: { createdAt: "asc" },
  });

  const albumRows = await Promise.all(
    albums.map(async (album) => ({
      id: album.id,
      name: album.name,
      fileCount: album._count.files,
      canDelete:
        album.createdById === member.id || member.role === FamilyRole.PARENT || member.role === FamilyRole.GUARDIAN,
    }))
  );

  const files = await prisma.mediaFile.findMany({
    where: { familyId },
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
      initialAlbumId="all"
      initialFiles={fileRows}
    />
  );
}
