-- CreateEnum
CREATE TYPE "ShareTransactionType" AS ENUM ('PURCHASE', 'RETURN', 'DIVIDEND', 'TRANSFER_IN', 'TRANSFER_OUT');

-- AlterTable
ALTER TABLE "day_book" ADD COLUMN     "denominations" JSONB;

-- AlterTable
ALTER TABLE "user_accounts" ADD COLUMN     "accruedInterest" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "lastInterestPostedDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "share_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "share_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "share_transactions" (
    "id" TEXT NOT NULL,
    "shareAccountId" TEXT NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionType" "ShareTransactionType" NOT NULL,
    "shareCount" INTEGER NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "sharePrice" DECIMAL(10,2) NOT NULL DEFAULT 100,
    "description" TEXT,
    "certificateId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "share_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "share_certificates" (
    "id" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "shareAccountId" TEXT NOT NULL,
    "shareCount" INTEGER NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "issuedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "CertificateStatus" NOT NULL DEFAULT 'GENERATED',
    "issuedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "share_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_provisions" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "classification" TEXT NOT NULL,
    "overdueDays" INTEGER NOT NULL,
    "provisionPercent" DECIMAL(5,2) NOT NULL,
    "provisionAmount" DECIMAL(15,2) NOT NULL,
    "provisionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loan_provisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "share_accounts_userId_key" ON "share_accounts"("userId");

-- CreateIndex
CREATE INDEX "share_transactions_shareAccountId_idx" ON "share_transactions"("shareAccountId");

-- CreateIndex
CREATE INDEX "share_transactions_transactionDate_idx" ON "share_transactions"("transactionDate");

-- CreateIndex
CREATE UNIQUE INDEX "share_certificates_certificateNumber_key" ON "share_certificates"("certificateNumber");

-- CreateIndex
CREATE INDEX "share_certificates_shareAccountId_idx" ON "share_certificates"("shareAccountId");

-- CreateIndex
CREATE INDEX "loan_provisions_loanId_idx" ON "loan_provisions"("loanId");

-- CreateIndex
CREATE INDEX "loan_provisions_classification_idx" ON "loan_provisions"("classification");

-- AddForeignKey
ALTER TABLE "share_accounts" ADD CONSTRAINT "share_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_transactions" ADD CONSTRAINT "share_transactions_shareAccountId_fkey" FOREIGN KEY ("shareAccountId") REFERENCES "share_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_transactions" ADD CONSTRAINT "share_transactions_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "share_certificates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_transactions" ADD CONSTRAINT "share_transactions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_certificates" ADD CONSTRAINT "share_certificates_shareAccountId_fkey" FOREIGN KEY ("shareAccountId") REFERENCES "share_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_certificates" ADD CONSTRAINT "share_certificates_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_provisions" ADD CONSTRAINT "loan_provisions_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
