/*
  Warnings:

  - Added the required column `userId` to the `ActivitySession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ActivitySession" ADD COLUMN     "userId" INTEGER NOT NULL;
