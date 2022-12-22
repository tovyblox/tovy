/*
  Warnings:

  - You are about to drop the column `gameId` on the `ActivitySession` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ActivitySession" DROP COLUMN "gameId",
ADD COLUMN     "universeId" BIGINT;
