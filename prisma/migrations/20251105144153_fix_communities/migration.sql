/*
  Warnings:

  - You are about to drop the column `location` on the `Mass` table. All the data in the column will be lost.
  - Added the required column `communityId` to the `Mass` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Mass" DROP COLUMN "location",
ADD COLUMN     "communityId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "communities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "neighborhood" TEXT,
    "city" TEXT DEFAULT 'Cuiabá',
    "state" TEXT DEFAULT 'MT',
    "zipCode" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "image" TEXT,
    "mapUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "communities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "communities_slug_key" ON "communities"("slug");

-- CreateIndex
CREATE INDEX "communities_slug_idx" ON "communities"("slug");

-- CreateIndex
CREATE INDEX "communities_active_idx" ON "communities"("active");

-- CreateIndex
CREATE INDEX "Mass_communityId_idx" ON "Mass"("communityId");

-- CreateIndex
CREATE INDEX "Mass_dayOfWeek_active_idx" ON "Mass"("dayOfWeek", "active");

-- AddForeignKey
ALTER TABLE "Mass" ADD CONSTRAINT "Mass_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
