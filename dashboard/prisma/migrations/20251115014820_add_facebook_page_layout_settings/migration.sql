/*
  Warnings:

  - You are about to drop the column `showTest3` on the `LayoutSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LayoutSettings" DROP COLUMN "showTest3";

-- CreateTable
CREATE TABLE "FacebookPageLayoutSettings" (
    "id" TEXT NOT NULL,
    "facebookPageId" TEXT NOT NULL,
    "showGenerateContent" BOOLEAN NOT NULL DEFAULT true,
    "showViewContent" BOOLEAN NOT NULL DEFAULT true,
    "showUploadContent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacebookPageLayoutSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FacebookPageLayoutSettings_facebookPageId_key" ON "FacebookPageLayoutSettings"("facebookPageId");

-- CreateIndex
CREATE INDEX "FacebookPageLayoutSettings_facebookPageId_idx" ON "FacebookPageLayoutSettings"("facebookPageId");

-- AddForeignKey
ALTER TABLE "FacebookPageLayoutSettings" ADD CONSTRAINT "FacebookPageLayoutSettings_facebookPageId_fkey" FOREIGN KEY ("facebookPageId") REFERENCES "FacebookPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
