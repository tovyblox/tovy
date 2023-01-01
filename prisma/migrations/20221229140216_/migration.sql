/*
  Warnings:

  - The primary key for the `Ally` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Ally` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `groupId` to the `Ally` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `A` on the `_AllyTouser` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "_AllyTouser" DROP CONSTRAINT "_AllyTouser_A_fkey";

-- DropIndex
DROP INDEX "Ally_id_key";

-- AlterTable
ALTER TABLE "Ally" DROP CONSTRAINT "Ally_pkey",
ADD COLUMN     "groupId" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Ally_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "_AllyTouser" DROP COLUMN "A",
ADD COLUMN     "A" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "_AllyTouser_AB_unique" ON "_AllyTouser"("A", "B");

-- AddForeignKey
ALTER TABLE "_AllyTouser" ADD CONSTRAINT "_AllyTouser_A_fkey" FOREIGN KEY ("A") REFERENCES "Ally"("id") ON DELETE CASCADE ON UPDATE CASCADE;
