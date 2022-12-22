-- AlterTable
ALTER TABLE "ActivitySession" ALTER COLUMN "messages" DROP NOT NULL,
ALTER COLUMN "messages" DROP DEFAULT;
