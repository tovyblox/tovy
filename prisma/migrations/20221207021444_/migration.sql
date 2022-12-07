-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "webhookBody" TEXT,
ADD COLUMN     "webhookEnabled" BOOLEAN,
ADD COLUMN     "webhookTitle" TEXT,
ADD COLUMN     "webhookUrl" TEXT;
