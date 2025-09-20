/*
  Warnings:

  - A unique constraint covering the columns `[bookNumber]` on the table `day_book` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bookNumber` to the `day_book` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DayBookTransactionType" AS ENUM ('CASH_RECEIPT', 'CASH_PAYMENT', 'BANK_DEPOSIT', 'BANK_WITHDRAWAL', 'INTERNAL_TRANSFER', 'LOAN_DISBURSEMENT', 'LOAN_PAYMENT', 'INTEREST_RECEIVED', 'INTEREST_PAID', 'FEE_RECEIVED', 'FEE_PAID', 'OTHER_INCOME', 'OTHER_EXPENSE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CHEQUE', 'BANK_TRANSFER', 'ONLINE', 'CARD', 'OTHER');

-- AlterTable
-- First add the new columns without NOT NULL constraint
ALTER TABLE "day_book" ADD COLUMN     "bookNumber" TEXT,
ADD COLUMN     "closingBalance" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "openingBalance" DECIMAL(15,2) NOT NULL DEFAULT 0;

-- Update existing records with generated book numbers using a CTE
WITH numbered_rows AS (
  SELECT id, 'DB' || TO_CHAR("transactionDate", 'YYYYMMDD') || '-' || LPAD(ROW_NUMBER() OVER (ORDER BY "createdAt")::TEXT, 2, '0') as new_book_number
  FROM "day_book"
  WHERE "bookNumber" IS NULL
)
UPDATE "day_book" 
SET "bookNumber" = numbered_rows.new_book_number
FROM numbered_rows
WHERE "day_book".id = numbered_rows.id;

-- Update closingBalance to match systemCashBalance for existing records
UPDATE "day_book" 
SET "closingBalance" = "systemCashBalance",
    "openingBalance" = "systemCashBalance"
WHERE "closingBalance" = 0;

-- Now add the NOT NULL constraint
ALTER TABLE "day_book" ALTER COLUMN "bookNumber" SET NOT NULL;

-- AlterTable
ALTER TABLE "journal_entries" ADD COLUMN     "dayBookId" TEXT;

-- CreateTable
CREATE TABLE "day_book_transactions" (
    "id" TEXT NOT NULL,
    "dayBookId" TEXT NOT NULL,
    "transactionNumber" TEXT NOT NULL,
    "transactionType" "DayBookTransactionType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "description" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "counterparty" TEXT,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH',
    "journalEntryId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "day_book_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "day_book_transactions_transactionNumber_key" ON "day_book_transactions"("transactionNumber");

-- CreateIndex
CREATE INDEX "day_book_transactions_dayBookId_idx" ON "day_book_transactions"("dayBookId");

-- CreateIndex
CREATE INDEX "day_book_transactions_transactionType_idx" ON "day_book_transactions"("transactionType");

-- CreateIndex
CREATE INDEX "day_book_transactions_createdAt_idx" ON "day_book_transactions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "day_book_bookNumber_key" ON "day_book"("bookNumber");

-- CreateIndex
CREATE INDEX "day_book_transactionDate_idx" ON "day_book"("transactionDate");

-- CreateIndex
CREATE INDEX "day_book_bookNumber_idx" ON "day_book"("bookNumber");

-- CreateIndex
CREATE INDEX "journal_entries_dayBookId_idx" ON "journal_entries"("dayBookId");

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_dayBookId_fkey" FOREIGN KEY ("dayBookId") REFERENCES "day_book"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "day_book_transactions" ADD CONSTRAINT "day_book_transactions_dayBookId_fkey" FOREIGN KEY ("dayBookId") REFERENCES "day_book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "day_book_transactions" ADD CONSTRAINT "day_book_transactions_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "journal_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "day_book_transactions" ADD CONSTRAINT "day_book_transactions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
