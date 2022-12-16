/*
  Warnings:

  - Added the required column `name` to the `Quota` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Quota" ADD COLUMN     "name" TEXT NOT NULL;
