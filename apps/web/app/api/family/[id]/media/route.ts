import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, MemberStatus, FamilyRole, MediaType } from "@myfamily/db";
import { createMediaFileSchema, MAX_UPLOAD_SIZE_BYTES } from "@myfamily/shared";
import { getViewUrl, getObjectMetadata, deleteMediaObject } from "@/lib/s3";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png"];

async function getOrCreateDefaultAlbumId(familyId: string) {
  const existing = await prisma.album.findFirst({
    where: { familyId, type: "DEFAULT" },
  });

  if (existing) {
    return existing.id;
  }

  const created = await prisma.album.create({
    data: { name: "Wszystkie zdjęcia", type: "DEFAULT", familyId },
  });

  return created.id;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: familyId } = await params;
  const { searchParams } = new URL(request.url);
  const albumId = searchParams.get("albumId") ?? undefined;

  const membership = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: session.user.id, familyId } },
  });

  if (!membership || membership.status !== MemberStatus.ACTIVE) {
    return NextResponse.json({ error: "You are not a member of this family" }, { status: 403 });
  }

  const files = await prisma.mediaFile.findMany({
    where: { familyId, ...(albumId ? { albumId } : {}) },
    orderBy: { uploadedAt: "desc" },
  });

  const result = await Promise.all(
    files.map(async (file) => ({
      id: file.id,
      albumId: file.albumId,
      originalName: file.originalName,
      url: await getViewUrl(file.storageKey),
      uploadedAt: file.uploadedAt,
      canDelete:
        file.uploadedById === membership.id ||
        membership.role === FamilyRole.PARENT ||
        membership.role === FamilyRole.GUARDIAN,
    }))
  );

  return NextResponse.json({ files: result }, { status: 200 });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: familyId } = await params;

  const body = await request.json();
  const parsed = createMediaFileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid file data" }, { status: 400 });
  }

  const membership = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: session.user.id, familyId } },
  });

  if (!membership || membership.status !== MemberStatus.ACTIVE) {
    return NextResponse.json({ error: "You are not a member of this family" }, { status: 403 });
  }

  const albumId = parsed.data.albumId ?? (await getOrCreateDefaultAlbumId(familyId));

  const album = await prisma.album.findUnique({ where: { id: albumId } });
  if (!album || album.familyId !== familyId) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  const metadata = await getObjectMetadata(parsed.data.storageKey);
  if (metadata === null) {
    return NextResponse.json({ error: "File not found in storage" }, { status: 400 });
  }
  if (metadata.sizeBytes > MAX_UPLOAD_SIZE_BYTES) {
    await deleteMediaObject(parsed.data.storageKey);
    return NextResponse.json({ error: "File is too large, max 8MB" }, { status: 400 });
  }
  if (!ALLOWED_MIME_TYPES.includes(metadata.contentType)) {
    await deleteMediaObject(parsed.data.storageKey);
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  const mediaFile = await prisma.mediaFile.create({
    data: {
      storageKey: parsed.data.storageKey,
      originalName: parsed.data.originalName,
      mimeType: metadata.contentType,
      sizeBytes: metadata.sizeBytes,
      type: MediaType.IMAGE,
      familyId,
      albumId,
      uploadedById: membership.id,
    },
  });

  return NextResponse.json({ id: mediaFile.id }, { status: 201 });
}
