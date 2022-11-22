/*
  Warnings:

  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "_roleTouser" DROP CONSTRAINT "_roleTouser_B_fkey";

-- DropForeignKey
ALTER TABLE "document" DROP CONSTRAINT "document_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "inactivityNotice" DROP CONSTRAINT "inactivityNotice_userId_fkey";

-- DropForeignKey
ALTER TABLE "wallPost" DROP CONSTRAINT "wallPost_authorId_fkey";

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "ownerId" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "_roleTouser" ALTER COLUMN "B" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "document" ALTER COLUMN "ownerId" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "inactivityNotice" ALTER COLUMN "userId" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "user" DROP CONSTRAINT "user_pkey",
ALTER COLUMN "userid" SET DATA TYPE BIGINT,
ADD CONSTRAINT "user_pkey" PRIMARY KEY ("userid");

-- AlterTable
ALTER TABLE "wallPost" ALTER COLUMN "authorId" SET DATA TYPE BIGINT;

-- AddForeignKey
ALTER TABLE "wallPost" ADD CONSTRAINT "wallPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inactivityNotice" ADD CONSTRAINT "inactivityNotice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_roleTouser" ADD CONSTRAINT "_roleTouser_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("userid") ON DELETE CASCADE ON UPDATE CASCADE;
