/*
  Warnings:

  - Added the required column `workspaceGroupId` to the `role` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "role" ADD COLUMN     "isOwnerRole" BOOLEAN,
ADD COLUMN     "workspaceGroupId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_workspaceGroupId_fkey" FOREIGN KEY ("workspaceGroupId") REFERENCES "workspace"("groupId") ON DELETE RESTRICT ON UPDATE CASCADE;
