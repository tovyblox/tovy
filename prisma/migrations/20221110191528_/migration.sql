-- CreateTable
CREATE TABLE "inactivityNotice" (
    "id" UUID NOT NULL,
    "userId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "reason" TEXT NOT NULL,

    CONSTRAINT "inactivityNotice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inactivityNotice_id_key" ON "inactivityNotice"("id");
