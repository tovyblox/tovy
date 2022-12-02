-- CreateTable
CREATE TABLE "workspace" (
    "groupId" INTEGER NOT NULL,

    CONSTRAINT "workspace_pkey" PRIMARY KEY ("groupId")
);

-- CreateTable
CREATE TABLE "config" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceGroupId" INTEGER NOT NULL,

    CONSTRAINT "config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instanceConfig" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instanceConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "userid" BIGINT NOT NULL,
    "isOwner" BOOLEAN,
    "picture" TEXT,
    "username" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("userid")
);

-- CreateTable
CREATE TABLE "userInfo" (
    "userid" BIGINT NOT NULL,
    "passwordhash" TEXT,
    "tfa" TEXT,

    CONSTRAINT "userInfo_pkey" PRIMARY KEY ("userid")
);

-- CreateTable
CREATE TABLE "role" (
    "id" UUID NOT NULL,
    "permissions" TEXT[],
    "isOwnerRole" BOOLEAN DEFAULT false,
    "workspaceGroupId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "groupRoles" INTEGER[],

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallPost" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceGroupId" INTEGER NOT NULL,
    "authorId" BIGINT NOT NULL,

    CONSTRAINT "wallPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionType" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "gameId" INTEGER,
    "allowUnscheduled" BOOLEAN NOT NULL,
    "workspaceGroupId" INTEGER NOT NULL,

    CONSTRAINT "SessionType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule" (
    "id" UUID NOT NULL,
    "Days" INTEGER[],
    "Hour" INTEGER NOT NULL,
    "Minute" INTEGER NOT NULL,
    "sessionTypeId" UUID NOT NULL,

    CONSTRAINT "schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "ownerId" BIGINT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "ended" TIMESTAMP(3),
    "sessionTypeId" UUID NOT NULL,
    "scheduleId" UUID,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivitySession" (
    "id" UUID NOT NULL,
    "userId" BIGINT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "idleTime" INTEGER,
    "workspaceGroupId" INTEGER NOT NULL,

    CONSTRAINT "ActivitySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inactivityNotice" (
    "id" UUID NOT NULL,
    "userId" BIGINT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "reason" TEXT NOT NULL,
    "approved" BOOLEAN DEFAULT false,
    "reviewed" BOOLEAN DEFAULT false,
    "workspaceGroupId" INTEGER NOT NULL,

    CONSTRAINT "inactivityNotice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" BIGINT NOT NULL,
    "workspaceGroupId" INTEGER NOT NULL,

    CONSTRAINT "document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userBook" (
    "id" UUID NOT NULL,
    "userId" BIGINT NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "adminId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceGroupId" INTEGER NOT NULL,

    CONSTRAINT "userBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rank" (
    "userId" BIGINT NOT NULL,
    "rankId" BIGINT NOT NULL,
    "workspaceGroupId" INTEGER NOT NULL,

    CONSTRAINT "rank_pkey" PRIMARY KEY ("userId","workspaceGroupId")
);

-- CreateTable
CREATE TABLE "_roleTouser" (
    "A" UUID NOT NULL,
    "B" BIGINT NOT NULL
);

-- CreateTable
CREATE TABLE "_SessionTypeTorole" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_documentTorole" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "workspace_groupId_key" ON "workspace"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "instanceConfig_key_key" ON "instanceConfig"("key");

-- CreateIndex
CREATE UNIQUE INDEX "user_userid_key" ON "user"("userid");

-- CreateIndex
CREATE UNIQUE INDEX "role_id_key" ON "role"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SessionType_id_key" ON "SessionType"("id");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_id_key" ON "schedule"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Session_id_key" ON "Session"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ActivitySession_id_key" ON "ActivitySession"("id");

-- CreateIndex
CREATE UNIQUE INDEX "inactivityNotice_id_key" ON "inactivityNotice"("id");

-- CreateIndex
CREATE UNIQUE INDEX "document_id_key" ON "document"("id");

-- CreateIndex
CREATE UNIQUE INDEX "userBook_id_key" ON "userBook"("id");

-- CreateIndex
CREATE UNIQUE INDEX "_roleTouser_AB_unique" ON "_roleTouser"("A", "B");

-- CreateIndex
CREATE INDEX "_roleTouser_B_index" ON "_roleTouser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SessionTypeTorole_AB_unique" ON "_SessionTypeTorole"("A", "B");

-- CreateIndex
CREATE INDEX "_SessionTypeTorole_B_index" ON "_SessionTypeTorole"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_documentTorole_AB_unique" ON "_documentTorole"("A", "B");

-- CreateIndex
CREATE INDEX "_documentTorole_B_index" ON "_documentTorole"("B");

-- AddForeignKey
ALTER TABLE "config" ADD CONSTRAINT "config_workspaceGroupId_fkey" FOREIGN KEY ("workspaceGroupId") REFERENCES "workspace"("groupId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userInfo" ADD CONSTRAINT "userInfo_userid_fkey" FOREIGN KEY ("userid") REFERENCES "user"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_workspaceGroupId_fkey" FOREIGN KEY ("workspaceGroupId") REFERENCES "workspace"("groupId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallPost" ADD CONSTRAINT "wallPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallPost" ADD CONSTRAINT "wallPost_workspaceGroupId_fkey" FOREIGN KEY ("workspaceGroupId") REFERENCES "workspace"("groupId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionType" ADD CONSTRAINT "SessionType_workspaceGroupId_fkey" FOREIGN KEY ("workspaceGroupId") REFERENCES "workspace"("groupId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_sessionTypeId_fkey" FOREIGN KEY ("sessionTypeId") REFERENCES "SessionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_sessionTypeId_fkey" FOREIGN KEY ("sessionTypeId") REFERENCES "SessionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivitySession" ADD CONSTRAINT "ActivitySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivitySession" ADD CONSTRAINT "ActivitySession_workspaceGroupId_fkey" FOREIGN KEY ("workspaceGroupId") REFERENCES "workspace"("groupId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inactivityNotice" ADD CONSTRAINT "inactivityNotice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inactivityNotice" ADD CONSTRAINT "inactivityNotice_workspaceGroupId_fkey" FOREIGN KEY ("workspaceGroupId") REFERENCES "workspace"("groupId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_workspaceGroupId_fkey" FOREIGN KEY ("workspaceGroupId") REFERENCES "workspace"("groupId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userBook" ADD CONSTRAINT "userBook_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "user"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userBook" ADD CONSTRAINT "userBook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userBook" ADD CONSTRAINT "userBook_workspaceGroupId_fkey" FOREIGN KEY ("workspaceGroupId") REFERENCES "workspace"("groupId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rank" ADD CONSTRAINT "rank_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rank" ADD CONSTRAINT "rank_workspaceGroupId_fkey" FOREIGN KEY ("workspaceGroupId") REFERENCES "workspace"("groupId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_roleTouser" ADD CONSTRAINT "_roleTouser_A_fkey" FOREIGN KEY ("A") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_roleTouser" ADD CONSTRAINT "_roleTouser_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("userid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SessionTypeTorole" ADD CONSTRAINT "_SessionTypeTorole_A_fkey" FOREIGN KEY ("A") REFERENCES "SessionType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SessionTypeTorole" ADD CONSTRAINT "_SessionTypeTorole_B_fkey" FOREIGN KEY ("B") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_documentTorole" ADD CONSTRAINT "_documentTorole_A_fkey" FOREIGN KEY ("A") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_documentTorole" ADD CONSTRAINT "_documentTorole_B_fkey" FOREIGN KEY ("B") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
