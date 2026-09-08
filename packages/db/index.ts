import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });

export { MemberStatus, FamilyRole, AlbumType, MediaType, RelationType, TaskStatus, TaskPriority, TransactionType } from "@prisma/client";
export type { PersonNode, PersonRelation, FamilyMember } from "@prisma/client";
