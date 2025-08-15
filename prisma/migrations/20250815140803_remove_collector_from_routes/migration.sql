/*
  Warnings:

  - You are about to drop the column `assigned_collector_id` on the `routes` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "routes" DROP CONSTRAINT "routes_assigned_collector_id_fkey";

-- AlterTable
ALTER TABLE "routes" DROP COLUMN "assigned_collector_id";
