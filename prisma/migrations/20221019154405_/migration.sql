-- AlterTable
ALTER TABLE "role" ALTER COLUMN "isOwnerRole" SET DEFAULT false;

-- CreateTable
CREATE TABLE "SessionType" (
    "id" UUID NOT NULL,
    "gameId" INTEGER,
    "allowUnscheduled" BOOLEAN NOT NULL,

    CONSTRAINT "SessionType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule" (
    "id" UUID NOT NULL,
    "Days" TEXT[],
    "Times" TEXT[],
    "sessionTypeId" UUID NOT NULL,

    CONSTRAINT "schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "sessionTypeId" UUID NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SessionType_id_key" ON "SessionType"("id");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_id_key" ON "schedule"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Session_id_key" ON "Session"("id");

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_sessionTypeId_fkey" FOREIGN KEY ("sessionTypeId") REFERENCES "SessionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_sessionTypeId_fkey" FOREIGN KEY ("sessionTypeId") REFERENCES "SessionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
