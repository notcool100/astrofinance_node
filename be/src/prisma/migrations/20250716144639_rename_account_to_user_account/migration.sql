/*
  Warnings:

  - You are about to drop the `accounts` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'INTEREST_CREDIT', 'FEE_DEBIT', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT');

-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_userId_fkey";

-- DropForeignKey
ALTER TABLE "bb_account_details" DROP CONSTRAINT "bb_account_details_accountId_fkey";

-- DropForeignKey
ALTER TABLE "mb_account_details" DROP CONSTRAINT "mb_account_details_accountId_fkey";

-- DropForeignKey
ALTER TABLE "tds_calculations" DROP CONSTRAINT "tds_calculations_accountId_fkey";

-- DropTable
DROP TABLE "accounts";

-- CreateTable
CREATE TABLE "user_accounts" (
    "id" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountType" "AccountType" NOT NULL,
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "interestRate" DECIMAL(5,2) NOT NULL,
    "openingDate" TIMESTAMP(3) NOT NULL,
    "lastTransactionDate" TIMESTAMP(3),
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_account_transactions" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "transactionType" "TransactionType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "referenceNumber" TEXT,
    "runningBalance" DECIMAL(15,2) NOT NULL,
    "journalEntryId" TEXT,
    "performedById" TEXT,
    "transactionMethod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_account_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_account_statements" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "statementNumber" TEXT NOT NULL,
    "periodStartDate" TIMESTAMP(3) NOT NULL,
    "periodEndDate" TIMESTAMP(3) NOT NULL,
    "openingBalance" DECIMAL(15,2) NOT NULL,
    "closingBalance" DECIMAL(15,2) NOT NULL,
    "totalDeposits" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalWithdrawals" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalInterestEarned" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalFees" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "generatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isGenerated" BOOLEAN NOT NULL DEFAULT false,
    "generatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_account_statements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_accounts_accountNumber_key" ON "user_accounts"("accountNumber");

-- CreateIndex
CREATE INDEX "user_accounts_userId_idx" ON "user_accounts"("userId");

-- CreateIndex
CREATE INDEX "user_accounts_accountType_idx" ON "user_accounts"("accountType");

-- CreateIndex
CREATE INDEX "user_accounts_status_idx" ON "user_accounts"("status");

-- CreateIndex
CREATE INDEX "user_accounts_openingDate_idx" ON "user_accounts"("openingDate");

-- CreateIndex
CREATE INDEX "user_accounts_createdById_idx" ON "user_accounts"("createdById");

-- CreateIndex
CREATE INDEX "user_account_transactions_accountId_idx" ON "user_account_transactions"("accountId");

-- CreateIndex
CREATE INDEX "user_account_transactions_transactionDate_idx" ON "user_account_transactions"("transactionDate");

-- CreateIndex
CREATE INDEX "user_account_transactions_accountId_transactionDate_idx" ON "user_account_transactions"("accountId", "transactionDate");

-- CreateIndex
CREATE INDEX "user_account_transactions_journalEntryId_idx" ON "user_account_transactions"("journalEntryId");

-- CreateIndex
CREATE INDEX "user_account_transactions_transactionType_idx" ON "user_account_transactions"("transactionType");

-- CreateIndex
CREATE UNIQUE INDEX "user_account_statements_statementNumber_key" ON "user_account_statements"("statementNumber");

-- CreateIndex
CREATE INDEX "user_account_statements_accountId_idx" ON "user_account_statements"("accountId");

-- CreateIndex
CREATE INDEX "user_account_statements_periodStartDate_periodEndDate_idx" ON "user_account_statements"("periodStartDate", "periodEndDate");

-- CreateIndex
CREATE INDEX "user_account_statements_accountId_periodStartDate_periodEnd_idx" ON "user_account_statements"("accountId", "periodStartDate", "periodEndDate");

-- AddForeignKey
ALTER TABLE "user_accounts" ADD CONSTRAINT "user_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_accounts" ADD CONSTRAINT "user_accounts_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_account_transactions" ADD CONSTRAINT "user_account_transactions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_account_transactions" ADD CONSTRAINT "user_account_transactions_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "journal_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_account_transactions" ADD CONSTRAINT "user_account_transactions_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bb_account_details" ADD CONSTRAINT "bb_account_details_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mb_account_details" ADD CONSTRAINT "mb_account_details_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_account_statements" ADD CONSTRAINT "user_account_statements_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_account_statements" ADD CONSTRAINT "user_account_statements_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tds_calculations" ADD CONSTRAINT "tds_calculations_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
