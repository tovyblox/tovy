-- AlterTable
ALTER TABLE "user" ADD COLUMN     "allyId" TEXT;

-- CreateTable
CREATE TABLE "Ally" (
    "id" TEXT NOT NULL,
    "workspaceGroupId" INTEGER NOT NULL,

    CONSTRAINT "Ally_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ally_id_key" ON "Ally"("id");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_allyId_fkey" FOREIGN KEY ("allyId") REFERENCES "Ally"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ally" ADD CONSTRAINT "Ally_workspaceGroupId_fkey" FOREIGN KEY ("workspaceGroupId") REFERENCES "workspace"("groupId") ON DELETE RESTRICT ON UPDATE CASCADE;
