-- CreateTable
CREATE TABLE "BackgroundImage" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BackgroundImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BackgroundImage_uploadedById_idx" ON "BackgroundImage"("uploadedById");

-- CreateIndex
CREATE INDEX "BackgroundImage_createdAt_idx" ON "BackgroundImage"("createdAt");

-- AddForeignKey
ALTER TABLE "BackgroundImage" ADD CONSTRAINT "BackgroundImage_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
