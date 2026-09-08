
-- AlterEnum
BEGIN;
CREATE TYPE "MemberStatus_new" AS ENUM ('PENDING', 'ACTIVE', 'LEFT', 'REMOVED');
ALTER TABLE "public"."FamilyMember" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "FamilyMember" ALTER COLUMN "status" TYPE "MemberStatus_new" USING ("status"::text::"MemberStatus_new");
ALTER TYPE "MemberStatus" RENAME TO "MemberStatus_old";
ALTER TYPE "MemberStatus_new" RENAME TO "MemberStatus";
DROP TYPE "public"."MemberStatus_old";
ALTER TABLE "FamilyMember" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
