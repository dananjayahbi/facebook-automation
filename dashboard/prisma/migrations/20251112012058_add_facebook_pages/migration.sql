-- AlterTable
ALTER TABLE "LayoutSettings" ADD COLUMN     "showTest3" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "FacebookPage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "pageId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacebookPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "author" TEXT,
    "category" TEXT,
    "generatedBy" TEXT,
    "facebookPageId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Background" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "imageUrl" TEXT,
    "generatedBy" TEXT,
    "aspectRatio" TEXT,
    "facebookPageId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Background_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserActivePage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "facebookPageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserActivePage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FacebookPage_isActive_idx" ON "FacebookPage"("isActive");

-- CreateIndex
CREATE INDEX "Quote_facebookPageId_idx" ON "Quote"("facebookPageId");

-- CreateIndex
CREATE INDEX "Quote_createdById_idx" ON "Quote"("createdById");

-- CreateIndex
CREATE INDEX "Quote_createdAt_idx" ON "Quote"("createdAt");

-- CreateIndex
CREATE INDEX "Background_facebookPageId_idx" ON "Background"("facebookPageId");

-- CreateIndex
CREATE INDEX "Background_createdById_idx" ON "Background"("createdById");

-- CreateIndex
CREATE INDEX "Background_createdAt_idx" ON "Background"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserActivePage_userId_key" ON "UserActivePage"("userId");

-- CreateIndex
CREATE INDEX "UserActivePage_userId_idx" ON "UserActivePage"("userId");

-- CreateIndex
CREATE INDEX "UserActivePage_facebookPageId_idx" ON "UserActivePage"("facebookPageId");

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_facebookPageId_fkey" FOREIGN KEY ("facebookPageId") REFERENCES "FacebookPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Background" ADD CONSTRAINT "Background_facebookPageId_fkey" FOREIGN KEY ("facebookPageId") REFERENCES "FacebookPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Background" ADD CONSTRAINT "Background_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivePage" ADD CONSTRAINT "UserActivePage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivePage" ADD CONSTRAINT "UserActivePage_facebookPageId_fkey" FOREIGN KEY ("facebookPageId") REFERENCES "FacebookPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
