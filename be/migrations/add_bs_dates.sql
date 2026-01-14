-- Add Bikram Sambat (BS) date columns to all relevant tables
-- Migration created: 2026-01-13
-- Note: This migration adds BS date columns as nullable String fields to preserve exact BS dates

-- User table
ALTER TABLE "users" ADD COLUMN "dateOfBirth_bs" TEXT;

-- UserAccount table
ALTER TABLE "user_accounts" ADD COLUMN "openingDate_bs" TEXT;
ALTER TABLE "user_accounts" ADD COLUMN "lastTransactionDate_bs" TEXT;
ALTER TABLE "user_accounts" ADD COLUMN "lastInterestPostedDate_bs" TEXT;

-- UserAccountTransaction table
ALTER TABLE "user_account_transactions" ADD COLUMN "transactionDate_bs" TEXT;

-- BbAccountDetails table
ALTER TABLE "bb_account_details" ADD COLUMN "maturityDate_bs" TEXT;

-- MbAccountDetails table
ALTER TABLE "mb_account_details" ADD COLUMN "maturityDate_bs" TEXT;

-- UserAccountStatement table
ALTER TABLE "user_account_statements" ADD COLUMN "periodStartDate_bs" TEXT;
ALTER TABLE "user_account_statements" ADD COLUMN "periodEndDate_bs" TEXT;

-- LoanApplication table
ALTER TABLE "loan_applications" ADD COLUMN "appliedDate_bs" TEXT;
ALTER TABLE "loan_applications" ADD COLUMN "approvedDate_bs" TEXT;

-- Loan table
ALTER TABLE "loans" ADD COLUMN "disbursementDate_bs" TEXT;
ALTER TABLE "loans" ADD COLUMN "firstPaymentDate_bs" TEXT;
ALTER TABLE "loans" ADD COLUMN "lastPaymentDate_bs" TEXT;
ALTER TABLE "loans" ADD COLUMN "closureDate_bs" TEXT;

-- LoanInstallment table
ALTER TABLE "loan_installments" ADD COLUMN "dueDate_bs" TEXT;
ALTER TABLE "loan_installments" ADD COLUMN "paymentDate_bs" TEXT;

-- LoanPayment table
ALTER TABLE "loan_payments" ADD COLUMN "paymentDate_bs" TEXT;

-- JournalEntry table
ALTER TABLE "journal_entries" ADD COLUMN "entryDate_bs" TEXT;

-- DayBook table
ALTER TABLE "day_book" ADD COLUMN "transactionDate_bs" TEXT;
ALTER TABLE "day_book" ADD COLUMN "closedAt_bs" TEXT;

-- Optional: Update existing records with converted BS dates
-- Uncomment and modify as needed
-- UPDATE "users" SET "dateOfBirth_bs" = /* conversion function */ WHERE "date OfBirth_bs" IS NULL;
