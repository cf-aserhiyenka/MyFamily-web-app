-- CreateTable
CREATE TABLE "FamilyInvitation" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "FamilyRole" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "familyId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,

    CONSTRAINT "FamilyInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FamilyInvitation_token_key" ON "FamilyInvitation"("token");

-- AddForeignKey
ALTER TABLE "FamilyInvitation" ADD CONSTRAINT "FamilyInvitation_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyInvitation" ADD CONSTRAINT "FamilyInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "FamilyMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
