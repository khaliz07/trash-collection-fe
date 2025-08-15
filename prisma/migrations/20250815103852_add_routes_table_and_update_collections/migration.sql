/*
  Warnings:

  - You are about to drop the column `customerId` on the `collections` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionId` on the `collections` table. All the data in the column will be lost.
  - You are about to drop the column `wasteTypes` on the `collections` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "collections" DROP CONSTRAINT "collections_customerId_fkey";

-- DropForeignKey
ALTER TABLE "collections" DROP CONSTRAINT "collections_subscriptionId_fkey";

-- DropIndex
DROP INDEX "collections_customerId_idx";

-- AlterTable
ALTER TABLE "collections" DROP COLUMN "customerId",
DROP COLUMN "subscriptionId",
DROP COLUMN "wasteTypes";

-- CreateTable
CREATE TABLE "routes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startTime" JSONB NOT NULL,
    "status" "RouteStatus" NOT NULL DEFAULT 'DRAFT',
    "trackPoints" JSONB NOT NULL,
    "estimated_duration" INTEGER NOT NULL,
    "total_distance_km" DECIMAL(8,3),
    "assigned_collector_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_assigned_collector_id_fkey" FOREIGN KEY ("assigned_collector_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
