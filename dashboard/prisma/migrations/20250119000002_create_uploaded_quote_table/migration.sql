-- CreateTable
CREATE TABLE "UploadedQuote" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "author" TEXT,
    "category" TEXT,
    "source" TEXT,
    "tags" TEXT,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "facebookPageId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UploadedQuote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UploadedQuote_facebookPageId_idx" ON "UploadedQuote"("facebookPageId");

-- CreateIndex
CREATE INDEX "UploadedQuote_uploadedById_idx" ON "UploadedQuote"("uploadedById");

-- CreateIndex
CREATE INDEX "UploadedQuote_createdAt_idx" ON "UploadedQuote"("createdAt");

-- CreateIndex
CREATE INDEX "UploadedQuote_category_idx" ON "UploadedQuote"("category");

-- CreateIndex
CREATE INDEX "UploadedQuote_isUsed_idx" ON "UploadedQuote"("isUsed");

-- AddForeignKey
ALTER TABLE "UploadedQuote" ADD CONSTRAINT "UploadedQuote_facebookPageId_fkey" FOREIGN KEY ("facebookPageId") REFERENCES "FacebookPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadedQuote" ADD CONSTRAINT "UploadedQuote_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
