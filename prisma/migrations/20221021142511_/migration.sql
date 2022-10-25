/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `sessionTypeId` on the `role` table. All the data in the column will be lost.
  - Added the required column `date` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_roleId_fkey";

-- DropForeignKey
ALTER TABLE "role" DROP CONSTRAINT "role_sessionTypeId_fkey";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "createdAt",
DROP COLUMN "roleId",
DROP COLUMN "updatedAt",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "role" DROP COLUMN "sessionTypeId";

-- CreateTable
CREATE TABLE "_SessionTypeTorole" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_SessionTypeTorole_AB_unique" ON "_SessionTypeTorole"("A", "B");

-- CreateIndex
CREATE INDEX "_SessionTypeTorole_B_index" ON "_SessionTypeTorole"("B");

-- AddForeignKey
ALTER TABLE "_SessionTypeTorole" ADD CONSTRAINT "_SessionTypeTorole_A_fkey" FOREIGN KEY ("A") REFERENCES "SessionType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SessionTypeTorole" ADD CONSTRAINT "_SessionTypeTorole_B_fkey" FOREIGN KEY ("B") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
