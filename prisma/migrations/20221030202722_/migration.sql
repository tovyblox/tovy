/*
  Warnings:

  - You are about to drop the column `Time` on the `schedule` table. All the data in the column will be lost.
  - Added the required column `Hour` to the `schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Minute` to the `schedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "schedule" DROP COLUMN "Time",
ADD COLUMN     "Hour" INTEGER NOT NULL,
ADD COLUMN     "Minute" INTEGER NOT NULL;
