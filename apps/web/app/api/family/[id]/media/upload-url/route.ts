import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, MemberStatus } from "@myfamily/db";
import { requestUploadUrlSchema } from "@myfamily/shared";
import { getUploadUrl } from "@/lib/s3";

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
  const parsed = requestUploadUrlSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid upload request" }, { status: 400 });
  }

  const membership = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: session.user.id, familyId } },
  });

  if (!membership || membership.status !== MemberStatus.ACTIVE) {
    return NextResponse.json({ error: "You are not a member of this family" }, { status: 403 });
  }

  const extension = parsed.data.contentType.split("/")[1];
  const storageKey = `families/${familyId}/${crypto.randomUUID()}.${extension}`;

  const uploadUrl = await getUploadUrl(storageKey, parsed.data.contentType);

  return NextResponse.json({ uploadUrl, storageKey }, { status: 200 });
}
