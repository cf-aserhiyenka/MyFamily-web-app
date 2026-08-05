/*
  Warnings:

  - Added the required column `createdById` to the `PersonNode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PersonNode` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RelationType" AS ENUM ('PARENT_OF', 'PARTNER_OF', 'SIBLING_OF');

-- AlterTable
-- createdById dodane jako nullable, zeby dograc istniejace wiersze przed ustawieniem NOT NULL (patrz backfill nizej)
ALTER TABLE "PersonNode" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "birthPlace" TEXT,
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "deathDate" TIMESTAMP(3),
ADD COLUMN     "deathPlace" TEXT,
ADD COLUMN     "maidenName" TEXT,
ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill: dla istniejacych osob przyjmujemy, ze wlascicielem konta = tworca rekordu
-- (wszystkie 8 obecnych wierszy PersonNode ma ustawione userId)
UPDATE "PersonNode" SET "createdById" = "userId" WHERE "createdById" IS NULL;

ALTER TABLE "PersonNode" ALTER COLUMN "createdById" SET NOT NULL;

-- CreateTable
CREATE TABLE "FamilyTreeMembership" (
    "id" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "personId" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "addedById" TEXT NOT NULL,

    CONSTRAINT "FamilyTreeMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonRelation" (
    "id" TEXT NOT NULL,
    "relation" "RelationType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "familyId" TEXT NOT NULL,
    "personAId" TEXT NOT NULL,
    "personBId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "PersonRelation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FamilyTreeMembership_personId_familyId_key" ON "FamilyTreeMembership"("personId", "familyId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonRelation_familyId_personAId_personBId_relation_key" ON "PersonRelation"("familyId", "personAId", "personBId", "relation");

-- AddForeignKey
ALTER TABLE "PersonNode" ADD CONSTRAINT "PersonNode_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyTreeMembership" ADD CONSTRAINT "FamilyTreeMembership_personId_fkey" FOREIGN KEY ("personId") REFERENCES "PersonNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyTreeMembership" ADD CONSTRAINT "FamilyTreeMembership_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyTreeMembership" ADD CONSTRAINT "FamilyTreeMembership_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "FamilyMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonRelation" ADD CONSTRAINT "PersonRelation_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonRelation" ADD CONSTRAINT "PersonRelation_personAId_fkey" FOREIGN KEY ("personAId") REFERENCES "PersonNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonRelation" ADD CONSTRAINT "PersonRelation_personBId_fkey" FOREIGN KEY ("personBId") REFERENCES "PersonNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonRelation" ADD CONSTRAINT "PersonRelation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
