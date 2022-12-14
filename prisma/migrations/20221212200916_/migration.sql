/*
  Warnings:

  - Added the required column `slot` to the `sessionUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sessionUser" ADD COLUMN     "slot" INTEGER NOT NULL;
