/*
  Warnings:

  - Added the required column `workspaceGroupId` to the `ActivitySession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceGroupId` to the `inactivityNotice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ActivitySession" ADD COLUMN     "workspaceGroupId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "inactivityNotice" ADD COLUMN     "workspaceGroupId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ActivitySession" ADD CONSTRAINT "ActivitySession_workspaceGroupId_fkey" FOREIGN KEY ("workspaceGroupId") REFERENCES "workspace"("groupId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inactivityNotice" ADD CONSTRAINT "inactivityNotice_workspaceGroupId_fkey" FOREIGN KEY ("workspaceGroupId") REFERENCES "workspace"("groupId") ON DELETE RESTRICT ON UPDATE CASCADE;
