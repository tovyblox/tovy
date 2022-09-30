-- CreateTable
CREATE TABLE "config" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "userid" INTEGER NOT NULL,
    "passwordhash" TEXT NOT NULL,
    "tfa" TEXT,
    "isOwner" BOOLEAN,
    "role" UUID
);

-- CreateTable
CREATE TABLE "role" (
    "id" UUID NOT NULL,
    "permissions" JSONB[],
    "name" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "config_key_key" ON "config"("key");

-- CreateIndex
CREATE UNIQUE INDEX "user_userid_key" ON "user"("userid");

-- CreateIndex
CREATE UNIQUE INDEX "role_id_key" ON "role"("id");
