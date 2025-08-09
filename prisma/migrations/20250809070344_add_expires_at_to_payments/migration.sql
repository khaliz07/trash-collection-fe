/*
  Warnings:

  - The values [INACTIVE] on the enum `SubscriptionStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `customerId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `frequency` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `nextBillingDate` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `planName` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `subscriptions` table. All the data in the column will be lost.
  - Added the required column `monthlyEquivalent` to the `packages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `packageId` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Made the column `subscriptionId` on table `payments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `paidAt` on table `payments` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `endMonth` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startMonth` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Made the column `packageId` on table `subscriptions` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "DebtStatus" AS ENUM ('UNPAID', 'PAID', 'OVERDUE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "FrequencyType" ADD VALUE 'QUARTERLY';
ALTER TYPE "FrequencyType" ADD VALUE 'YEARLY';

-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionStatus_new" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED');
ALTER TABLE "subscriptions" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "subscriptions" ALTER COLUMN "status" TYPE "SubscriptionStatus_new" USING ("status"::text::"SubscriptionStatus_new");
ALTER TYPE "SubscriptionStatus" RENAME TO "SubscriptionStatus_old";
ALTER TYPE "SubscriptionStatus_new" RENAME TO "SubscriptionStatus";
DROP TYPE "SubscriptionStatus_old";
ALTER TABLE "subscriptions" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_customerId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_customerId_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_packageId_fkey";

-- DropIndex
DROP INDEX "payments_customerId_idx";

-- AlterTable
ALTER TABLE "packages" ADD COLUMN     "monthlyEquivalent" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "tier" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "collectionsPerWeek" SET DEFAULT 2;

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "customerId",
ADD COLUMN     "coveredMonths" TEXT[],
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "packageId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "subscriptionId" SET NOT NULL,
ALTER COLUMN "paidAt" SET NOT NULL,
ALTER COLUMN "paidAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "customerId",
DROP COLUMN "description",
DROP COLUMN "endDate",
DROP COLUMN "frequency",
DROP COLUMN "nextBillingDate",
DROP COLUMN "planName",
DROP COLUMN "price",
DROP COLUMN "startDate",
ADD COLUMN     "activatedAt" TIMESTAMP(3),
ADD COLUMN     "endMonth" TEXT NOT NULL,
ADD COLUMN     "queuePosition" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "startMonth" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING',
ALTER COLUMN "packageId" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "debtMonths" TEXT[],
ADD COLUMN     "totalDebt" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "debt_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "DebtStatus" NOT NULL DEFAULT 'UNPAID',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debt_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "debt_records_userId_idx" ON "debt_records"("userId");

-- CreateIndex
CREATE INDEX "debt_records_status_idx" ON "debt_records"("status");

-- CreateIndex
CREATE INDEX "debt_records_dueDate_idx" ON "debt_records"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "debt_records_userId_month_key" ON "debt_records"("userId", "month");

-- CreateIndex
CREATE INDEX "payments_userId_idx" ON "payments"("userId");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_records" ADD CONSTRAINT "debt_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
