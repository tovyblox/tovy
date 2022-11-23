/*
  Warnings:

  - You are about to drop the column `passwordhash` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `tfa` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "passwordhash",
DROP COLUMN "tfa";

-- CreateTable
CREATE TABLE "userInfo" (
    "userid" BIGINT NOT NULL,
    "passwordhash" TEXT,
    "tfa" TEXT,

    CONSTRAINT "userInfo_pkey" PRIMARY KEY ("userid")
);

-- AddForeignKey
ALTER TABLE "userInfo" ADD CONSTRAINT "userInfo_userid_fkey" FOREIGN KEY ("userid") REFERENCES "user"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;
