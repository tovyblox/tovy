/*
  Warnings:

  - Made the column `workspaceGroupId` on table `config` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "config" DROP CONSTRAINT "config_workspaceGroupId_fkey";

-- AlterTable
ALTER TABLE "config" ALTER COLUMN "workspaceGroupId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "config" ADD CONSTRAINT "config_workspaceGroupId_fkey" FOREIGN KEY ("workspaceGroupId") REFERENCES "workspace"("groupId") ON DELETE RESTRICT ON UPDATE CASCADE;
