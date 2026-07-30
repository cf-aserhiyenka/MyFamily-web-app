import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, MemberStatus, FamilyRole, AlbumType } from "@myfamily/db";
import { createAlbumSchema } from "@myfamily/shared";

async function getOrCreateDefaultAlbum(familyId: string) {
  const existing = await prisma.album.findFirst({
    where: { familyId, type: AlbumType.DEFAULT },
  });

  if (existing) {
    return existing;
  }

  return prisma.album.create({
    data: {
      name: "Wszystkie zdjęcia",
      type: AlbumType.DEFAULT,
      familyId,
    },
  });
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

  const membership = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: session.user.id, familyId } },
  });

  if (!membership || membership.status !== MemberStatus.ACTIVE) {
    return NextResponse.json({ error: "You are not a member of this family" }, { status: 403 });
  }

  await getOrCreateDefaultAlbum(familyId);

  const albums = await prisma.album.findMany({
    where: { familyId },
    include: { _count: { select: { files: true } } },
    orderBy: { createdAt: "asc" },
  });

  const result = albums.map((album) => ({
    id: album.id,
    name: album.name,
    description: album.description,
    type: album.type,
    fileCount: album._count.files,
    canDelete:
      album.type === AlbumType.CUSTOM &&
      (album.createdById === membership.id ||
        membership.role === FamilyRole.PARENT ||
        membership.role === FamilyRole.GUARDIAN),
  }));

  return NextResponse.json({ albums: result }, { status: 200 });
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
  const parsed = createAlbumSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid album data" }, { status: 400 });
  }

  const membership = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: session.user.id, familyId } },
  });

  if (!membership || membership.status !== MemberStatus.ACTIVE) {
    return NextResponse.json({ error: "You are not a member of this family" }, { status: 403 });
  }

  const album = await prisma.album.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      type: AlbumType.CUSTOM,
      familyId,
      createdById: membership.id,
    },
  });

  return NextResponse.json({ id: album.id }, { status: 201 });
}
