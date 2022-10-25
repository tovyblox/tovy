-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "roleId" UUID;

-- AlterTable
ALTER TABLE "role" ADD COLUMN     "sessionTypeId" UUID;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_sessionTypeId_fkey" FOREIGN KEY ("sessionTypeId") REFERENCES "SessionType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;
