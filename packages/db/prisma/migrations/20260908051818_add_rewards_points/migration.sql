-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('TASK_REWARD', 'REWARD_REDEMPTION', 'MANUAL_ADJUSTMENT');

-- CreateTable
CREATE TABLE "Reward" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "pointCost" INTEGER NOT NULL,
    "stock" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "familyId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardRedemption" (
    "id" TEXT NOT NULL,
    "pointsSpent" INTEGER NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rewardId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,

    CONSTRAINT "RewardRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointTransaction" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "TransactionType" NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "memberId" TEXT NOT NULL,
    "taskId" TEXT,
    "redemptionId" TEXT,

    CONSTRAINT "PointTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PointTransaction_taskId_key" ON "PointTransaction"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "PointTransaction_redemptionId_key" ON "PointTransaction"("redemptionId");

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "FamilyMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardRedemption" ADD CONSTRAINT "RewardRedemption_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardRedemption" ADD CONSTRAINT "RewardRedemption_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "FamilyMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointTransaction" ADD CONSTRAINT "PointTransaction_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "FamilyMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointTransaction" ADD CONSTRAINT "PointTransaction_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointTransaction" ADD CONSTRAINT "PointTransaction_redemptionId_fkey" FOREIGN KEY ("redemptionId") REFERENCES "RewardRedemption"("id") ON DELETE SET NULL ON UPDATE CASCADE;
