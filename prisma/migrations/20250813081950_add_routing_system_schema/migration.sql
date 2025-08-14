/*
  Warnings:

  - A unique constraint covering the columns `[route_code]` on the table `collection_routes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[route_id,collector_id,assigned_date]` on the table `route_assignments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `active_days` to the `collection_routes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estimated_time_min` to the `collection_routes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `route_code` to the `collection_routes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `route_name` to the `collection_routes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `route_path` to the `collection_routes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `route_polyline` to the `collection_routes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time_windows` to the `collection_routes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_distance_km` to the `collection_routes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assigned_date` to the `route_assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `collector_id` to the `route_assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `route_id` to the `route_assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time_window_end` to the `route_assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time_window_start` to the `route_assignments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RouteStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "UrgencyLevel" AS ENUM ('MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "UrgentStatus" AS ENUM ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "route_assignments" DROP CONSTRAINT "route_assignments_collectorId_fkey";

-- DropForeignKey
ALTER TABLE "route_assignments" DROP CONSTRAINT "route_assignments_routeId_fkey";

-- DropIndex
DROP INDEX "route_assignments_routeId_collectorId_assignedDate_key";

-- AlterTable
ALTER TABLE "collection_routes" ADD COLUMN     "active_days" JSONB NOT NULL,
ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "estimated_time_min" INTEGER NOT NULL,
ADD COLUMN     "route_code" TEXT NOT NULL,
ADD COLUMN     "route_name" TEXT NOT NULL,
ADD COLUMN     "route_path" JSONB NOT NULL,
ADD COLUMN     "route_polyline" TEXT NOT NULL,
ADD COLUMN     "status" "RouteStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "time_windows" JSONB NOT NULL,
ADD COLUMN     "total_distance_km" DECIMAL(8,3) NOT NULL,
ADD COLUMN     "work_zone_id" TEXT,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "routeGeometry" DROP NOT NULL,
ALTER COLUMN "waypoints" DROP NOT NULL,
ALTER COLUMN "estimatedDuration" DROP NOT NULL,
ALTER COLUMN "estimatedDistance" DROP NOT NULL;

-- AlterTable
ALTER TABLE "route_assignments" ADD COLUMN     "actual_distance" DECIMAL(8,3),
ADD COLUMN     "actual_duration" INTEGER,
ADD COLUMN     "assigned_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "collector_id" TEXT NOT NULL,
ADD COLUMN     "completed_at" TIMESTAMP(3),
ADD COLUMN     "route_id" TEXT NOT NULL,
ADD COLUMN     "started_at" TIMESTAMP(3),
ADD COLUMN     "status" "AssignmentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "time_window_end" TEXT NOT NULL,
ADD COLUMN     "time_window_start" TEXT NOT NULL,
ALTER COLUMN "routeId" DROP NOT NULL,
ALTER COLUMN "collectorId" DROP NOT NULL,
ALTER COLUMN "assignedDate" DROP NOT NULL;

-- CreateTable
CREATE TABLE "urgent_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "pickup_address" TEXT NOT NULL,
    "pickup_lat" DECIMAL(10,8) NOT NULL,
    "pickup_lng" DECIMAL(11,8) NOT NULL,
    "requested_date" TIMESTAMP(3) NOT NULL,
    "urgency_level" "UrgencyLevel" NOT NULL,
    "waste_description" TEXT NOT NULL,
    "assigned_route_id" TEXT,
    "assigned_collector_id" TEXT,
    "assigned_at" TIMESTAMP(3),
    "status" "UrgentStatus" NOT NULL DEFAULT 'PENDING',
    "completed_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "urgent_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "collection_routes_route_code_key" ON "collection_routes"("route_code");

-- CreateIndex
CREATE UNIQUE INDEX "route_assignments_route_id_collector_id_assigned_date_key" ON "route_assignments"("route_id", "collector_id", "assigned_date");

-- AddForeignKey
ALTER TABLE "route_assignments" ADD CONSTRAINT "route_assignments_collector_id_fkey" FOREIGN KEY ("collector_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_assignments" ADD CONSTRAINT "route_assignments_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "collection_routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "urgent_requests" ADD CONSTRAINT "urgent_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "urgent_requests" ADD CONSTRAINT "urgent_requests_assigned_route_id_fkey" FOREIGN KEY ("assigned_route_id") REFERENCES "collection_routes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "urgent_requests" ADD CONSTRAINT "urgent_requests_assigned_collector_id_fkey" FOREIGN KEY ("assigned_collector_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
