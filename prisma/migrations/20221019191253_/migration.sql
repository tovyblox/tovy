/*
  Warnings:

  - Added the required column `workspaceGroupId` to the `SessionType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SessionType" ADD COLUMN     "workspaceGroupId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "SessionType" ADD CONSTRAINT "SessionType_workspaceGroupId_fkey" FOREIGN KEY ("workspaceGroupId") REFERENCES "workspace"("groupId") ON DELETE RESTRICT ON UPDATE CASCADE;
