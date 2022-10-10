-- CreateTable
CREATE TABLE "wallPost" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceGroupId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,

    CONSTRAINT "wallPost_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "wallPost" ADD CONSTRAINT "wallPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallPost" ADD CONSTRAINT "wallPost_workspaceGroupId_fkey" FOREIGN KEY ("workspaceGroupId") REFERENCES "workspace"("groupId") ON DELETE RESTRICT ON UPDATE CASCADE;
