/*
  Warnings:

  - You are about to drop the column `state` on the `Player` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Player" DROP COLUMN "state",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
