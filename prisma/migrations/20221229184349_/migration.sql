-- CreateTable
CREATE TABLE "allyVisit" (
    "id" UUID NOT NULL,
    "allyId" UUID NOT NULL,
    "hostId" BIGINT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "allyVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "allyVisit_id_key" ON "allyVisit"("id");

-- AddForeignKey
ALTER TABLE "allyVisit" ADD CONSTRAINT "allyVisit_allyId_fkey" FOREIGN KEY ("allyId") REFERENCES "Ally"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allyVisit" ADD CONSTRAINT "allyVisit_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "user"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;
