
-- DropForeignKey
ALTER TABLE "Album" DROP CONSTRAINT "Album_coverFileId_fkey";

-- DropIndex
DROP INDEX "Album_coverFileId_key";

-- AlterTable
ALTER TABLE "Album" DROP COLUMN "coverFileId";
