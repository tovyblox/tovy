/*
  Warnings:

  - You are about to drop the column `webhookBody` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `webhookEnabled` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `webhookTitle` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `webhookUrl` on the `Session` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Session" DROP COLUMN "webhookBody",
DROP COLUMN "webhookEnabled",
DROP COLUMN "webhookTitle",
DROP COLUMN "webhookUrl";

-- AlterTable
ALTER TABLE "SessionType" ADD COLUMN     "webhookBody" TEXT,
ADD COLUMN     "webhookEnabled" BOOLEAN,
ADD COLUMN     "webhookTitle" TEXT,
ADD COLUMN     "webhookUrl" TEXT;
