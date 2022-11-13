-- AlterTable
ALTER TABLE "inactivityNotice" ADD COLUMN     "approved" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "role" ALTER COLUMN "permissions" SET DATA TYPE TEXT[];
