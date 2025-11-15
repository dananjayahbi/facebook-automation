-- AlterTable
ALTER TABLE "FacebookPageLayoutSettings" 
ADD COLUMN IF NOT EXISTS "showBackgroundsGallery" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "showQuoteContentUpload" BOOLEAN NOT NULL DEFAULT true;
