-- CreateEnum
CREATE TYPE "SupportRequestType" AS ENUM ('PAYMENT', 'SCHEDULE', 'ACCOUNT', 'TECHNICAL_ISSUE', 'OTHER');

-- CreateEnum
CREATE TYPE "SupportRequestStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SupportPriority" AS ENUM ('NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "FAQCategory" AS ENUM ('PAYMENT', 'SCHEDULE', 'ACCOUNT', 'TECHNICAL_ISSUE', 'OTHER');

-- CreateTable
CREATE TABLE "support_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "SupportRequestType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "SupportRequestStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "SupportPriority" NOT NULL DEFAULT 'NORMAL',
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "handlerId" TEXT,
    "adminNotes" TEXT,

    CONSTRAINT "support_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_feedback" (
    "id" TEXT NOT NULL,
    "supportRequestId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" "FAQCategory" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "support_feedback_supportRequestId_key" ON "support_feedback"("supportRequestId");

-- AddForeignKey
ALTER TABLE "support_requests" ADD CONSTRAINT "support_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_requests" ADD CONSTRAINT "support_requests_handlerId_fkey" FOREIGN KEY ("handlerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_feedback" ADD CONSTRAINT "support_feedback_supportRequestId_fkey" FOREIGN KEY ("supportRequestId") REFERENCES "support_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
