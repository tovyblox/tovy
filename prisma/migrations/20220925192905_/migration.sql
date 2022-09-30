/*
  Warnings:

  - The primary key for the `config` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "config" DROP CONSTRAINT "config_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "config_pkey" PRIMARY KEY ("id");
