-- AlterTable
ALTER TABLE "SessionType" ADD COLUMN     "statues" JSONB[];

-- CreateTable
CREATE TABLE "sessionUser" (
    "userid" BIGINT NOT NULL,
    "sessionid" UUID NOT NULL,
    "roleID" TEXT NOT NULL,

    CONSTRAINT "sessionUser_pkey" PRIMARY KEY ("userid","sessionid")
);

-- AddForeignKey
ALTER TABLE "sessionUser" ADD CONSTRAINT "sessionUser_sessionid_fkey" FOREIGN KEY ("sessionid") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessionUser" ADD CONSTRAINT "sessionUser_userid_fkey" FOREIGN KEY ("userid") REFERENCES "user"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;
