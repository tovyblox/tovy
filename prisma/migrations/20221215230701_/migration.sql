-- CreateTable
CREATE TABLE "Quota" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "workspaceGroupId" INTEGER NOT NULL,

    CONSTRAINT "Quota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_QuotaTorole" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Quota_id_key" ON "Quota"("id");

-- CreateIndex
CREATE UNIQUE INDEX "_QuotaTorole_AB_unique" ON "_QuotaTorole"("A", "B");

-- CreateIndex
CREATE INDEX "_QuotaTorole_B_index" ON "_QuotaTorole"("B");

-- AddForeignKey
ALTER TABLE "Quota" ADD CONSTRAINT "Quota_workspaceGroupId_fkey" FOREIGN KEY ("workspaceGroupId") REFERENCES "workspace"("groupId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuotaTorole" ADD CONSTRAINT "_QuotaTorole_A_fkey" FOREIGN KEY ("A") REFERENCES "Quota"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuotaTorole" ADD CONSTRAINT "_QuotaTorole_B_fkey" FOREIGN KEY ("B") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
