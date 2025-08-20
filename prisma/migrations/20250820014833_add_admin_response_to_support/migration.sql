-- AlterTable
ALTER TABLE "support_requests" ADD COLUMN     "adminResponse" TEXT,
ADD COLUMN     "adminResponseAt" TIMESTAMP(3);
