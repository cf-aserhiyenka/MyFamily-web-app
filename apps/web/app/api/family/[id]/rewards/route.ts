import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@myfamily/db";
import { createRewardSchema } from "@myfamily/shared";
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

  const rewards = await prisma.reward.findMany({
    where: { familyId, isActive: true },
    orderBy: { pointCost: "asc" },
  });

  return NextResponse.json({ rewards }, { status: 200 });
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
  const parsed = createRewardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid reward data" }, { status: 400 });
  }

  const context = await getFamilyContext(session.user.id, familyId);
  if (!context?.isActiveMember || !context.membership) {
    return NextResponse.json({ error: "You are not a member of this family" }, { status: 403 });
  }
  if (!context.permissions?.manageTasks) {
    return NextResponse.json({ error: "Only parents or guardians can create rewards" }, { status: 403 });
  }

  const reward = await prisma.reward.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      pointCost: parsed.data.pointCost,
      stock: parsed.data.stock ?? null,
      familyId,
      createdById: context.membership.id,
    },
  });

  return NextResponse.json({ id: reward.id }, { status: 201 });
}
