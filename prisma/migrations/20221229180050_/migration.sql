/*
  Warnings:

  - The primary key for the `Ally` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `Ally` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `id` on the `Ally` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `A` on the `_AllyTouser` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "_AllyTouser" DROP CONSTRAINT "_AllyTouser_A_fkey";

-- AlterTable
ALTER TABLE "Ally" DROP CONSTRAINT "Ally_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "Ally_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "_AllyTouser" DROP COLUMN "A",
ADD COLUMN     "A" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Ally_id_key" ON "Ally"("id");

-- CreateIndex
CREATE UNIQUE INDEX "_AllyTouser_AB_unique" ON "_AllyTouser"("A", "B");

-- AddForeignKey
ALTER TABLE "_AllyTouser" ADD CONSTRAINT "_AllyTouser_A_fkey" FOREIGN KEY ("A") REFERENCES "Ally"("id") ON DELETE CASCADE ON UPDATE CASCADE;
