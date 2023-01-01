/*
  Warnings:

  - You are about to drop the column `allyId` on the `user` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_allyId_fkey";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "allyId";

-- CreateTable
CREATE TABLE "_AllyTouser" (
    "A" TEXT NOT NULL,
    "B" BIGINT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AllyTouser_AB_unique" ON "_AllyTouser"("A", "B");

-- CreateIndex
CREATE INDEX "_AllyTouser_B_index" ON "_AllyTouser"("B");

-- AddForeignKey
ALTER TABLE "_AllyTouser" ADD CONSTRAINT "_AllyTouser_A_fkey" FOREIGN KEY ("A") REFERENCES "Ally"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AllyTouser" ADD CONSTRAINT "_AllyTouser_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("userid") ON DELETE CASCADE ON UPDATE CASCADE;
