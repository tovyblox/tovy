/*
  Warnings:

  - The `notes` column on the `Ally` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Ally" DROP COLUMN "notes",
ADD COLUMN     "notes" TEXT[];
