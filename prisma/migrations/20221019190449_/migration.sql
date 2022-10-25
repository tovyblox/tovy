/*
  Warnings:

  - You are about to drop the column `Times` on the `schedule` table. All the data in the column will be lost.
  - Added the required column `name` to the `SessionType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Time` to the `schedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SessionType" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "schedule" DROP COLUMN "Times",
ADD COLUMN     "Time" TEXT NOT NULL;
