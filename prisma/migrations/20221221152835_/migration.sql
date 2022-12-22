/*
  Warnings:

  - Added the required column `gameId` to the `ActivitySession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ActivitySession" ADD COLUMN     "gameId" BIGINT NOT NULL DEFAULT 0,
ALTER COLUMN "idleTime" SET DATA TYPE BIGINT;
