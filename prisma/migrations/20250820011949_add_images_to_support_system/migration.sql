-- AlterTable
ALTER TABLE "support_feedback" ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "support_requests" ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];
