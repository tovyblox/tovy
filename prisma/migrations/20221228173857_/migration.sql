/*
  Warnings:

  - Added the required column `notes` to the `Ally` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ally" ADD COLUMN     "notes" TEXT NOT NULL;
