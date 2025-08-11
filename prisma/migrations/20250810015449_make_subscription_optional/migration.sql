-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_subscriptionId_fkey";

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "subscriptionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
