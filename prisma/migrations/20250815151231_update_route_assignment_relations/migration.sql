/*
  Warnings:

  - You are about to drop the column `assignedDate` on the `route_assignments` table. All the data in the column will be lost.
  - You are about to drop the column `collectorId` on the `route_assignments` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `route_assignments` table. All the data in the column will be lost.
  - You are about to drop the column `isCompleted` on the `route_assignments` table. All the data in the column will be lost.
  - You are about to drop the column `routeId` on the `route_assignments` table. All the data in the column will be lost.
  - You are about to drop the column `startedAt` on the `route_assignments` table. All the data in the column will be lost.
  - You are about to drop the column `totalDistance` on the `route_assignments` table. All the data in the column will be lost.
  - You are about to drop the column `totalDuration` on the `route_assignments` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "route_assignments" DROP CONSTRAINT "route_assignments_route_id_fkey";

-- AlterTable
ALTER TABLE "route_assignments" DROP COLUMN "assignedDate",
DROP COLUMN "collectorId",
DROP COLUMN "completedAt",
DROP COLUMN "isCompleted",
DROP COLUMN "routeId",
DROP COLUMN "startedAt",
DROP COLUMN "totalDistance",
DROP COLUMN "totalDuration",
ADD COLUMN     "notes" TEXT;

-- AddForeignKey
ALTER TABLE "route_assignments" ADD CONSTRAINT "route_assignments_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
