-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "scheduleId" UUID;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
