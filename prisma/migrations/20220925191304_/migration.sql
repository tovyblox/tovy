/*
  Warnings:

  - The primary key for the `config` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `groupId` to the `config` table without a default value. This is not possible if the table is not empty.
  - Made the column `value` on table `config` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "config_key_key";

-- AlterTable
ALTER TABLE "config" DROP CONSTRAINT "config_pkey",
ADD COLUMN     "groupId" INTEGER NOT NULL,
ADD COLUMN     "workspaceGroupId" INTEGER,
ALTER COLUMN "value" SET NOT NULL,
ADD CONSTRAINT "config_pkey" PRIMARY KEY ("groupId");

-- CreateTable
CREATE TABLE "workspace" (
    "groupId" INTEGER NOT NULL,

    CONSTRAINT "workspace_pkey" PRIMARY KEY ("groupId")
);

-- CreateIndex
CREATE UNIQUE INDEX "workspace_groupId_key" ON "workspace"("groupId");

-- AddForeignKey
ALTER TABLE "config" ADD CONSTRAINT "config_workspaceGroupId_fkey" FOREIGN KEY ("workspaceGroupId") REFERENCES "workspace"("groupId") ON DELETE SET NULL ON UPDATE CASCADE;
