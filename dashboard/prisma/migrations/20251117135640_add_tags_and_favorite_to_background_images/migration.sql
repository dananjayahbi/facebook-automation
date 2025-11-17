-- AlterTable
ALTER TABLE "BackgroundImage" ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "isFavorite" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "BackgroundImage_isFavorite_idx" ON "BackgroundImage"("isFavorite");
