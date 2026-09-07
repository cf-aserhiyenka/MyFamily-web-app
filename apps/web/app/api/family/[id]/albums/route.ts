import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, AlbumType } from "@myfamily/db";
import { createAlbumSchema } from "@myfamily/shared";
import { getFamilyContext } from "@/lib/permissions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: familyId } = await params;

  const context = await getFamilyContext(session.user.id, familyId);

  if (!context?.isActiveMember || !context.membership) {
    return NextResponse.json({ error: "You are not a member of this family" }, { status: 403 });
  }

  const albums = await prisma.album.findMany({
    where: { familyId },
    include: { _count: { select: { files: true } } },
    orderBy: { createdAt: "asc" },
  });

  const membership = context.membership;

  const result = albums.map((album) => ({
    id: album.id,
    name: album.name,
    description: album.description,
    fileCount: album._count.files,
    canDelete: album.createdById === membership.id || context.permissions?.manageArchive === true,
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

  const context = await getFamilyContext(session.user.id, familyId);

  if (!context?.isActiveMember || !context.membership) {
    return NextResponse.json({ error: "You are not a member of this family" }, { status: 403 });
  }

  const album = await prisma.album.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      type: AlbumType.CUSTOM,
      familyId,
      createdById: context.membership.id,
    },
  });

  return NextResponse.json({ id: album.id }, { status: 201 });
}
