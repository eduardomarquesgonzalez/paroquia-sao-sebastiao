/*
  Warnings:

  - You are about to drop the column `description` on the `Mass` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Mass" DROP COLUMN "description",
ADD COLUMN     "location" TEXT,
ADD COLUMN     "observations" TEXT,
ALTER COLUMN "dayOfWeek" SET DATA TYPE TEXT;
