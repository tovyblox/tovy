-- CreateTable
CREATE TABLE "ActivitySession" (
    "id" UUID NOT NULL,
    "active" BOOLEAN NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "idleTime" INTEGER,

    CONSTRAINT "ActivitySession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ActivitySession_id_key" ON "ActivitySession"("id");
