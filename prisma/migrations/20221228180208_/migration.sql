/*
  Warnings:

  - Added the required column `name` to the `Ally` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ally" ADD COLUMN     "name" TEXT NOT NULL;
