-- AlterTable
ALTER TABLE "bb_account_details" ADD COLUMN     "maturityDate_bs" TEXT;

-- AlterTable
ALTER TABLE "day_book" ADD COLUMN     "closedAt_bs" TEXT,
ADD COLUMN     "transactionDate_bs" TEXT;

-- AlterTable
ALTER TABLE "journal_entries" ADD COLUMN     "entryDate_bs" TEXT;

-- AlterTable
ALTER TABLE "loan_applications" ADD COLUMN     "appliedDate_bs" TEXT,
ADD COLUMN     "approvedDate_bs" TEXT;

-- AlterTable
ALTER TABLE "loan_installments" ADD COLUMN     "dueDate_bs" TEXT,
ADD COLUMN     "paymentDate_bs" TEXT;

-- AlterTable
ALTER TABLE "loan_payments" ADD COLUMN     "paymentDate_bs" TEXT;

-- AlterTable
ALTER TABLE "loans" ADD COLUMN     "closureDate_bs" TEXT,
ADD COLUMN     "disbursementDate_bs" TEXT,
ADD COLUMN     "firstPaymentDate_bs" TEXT,
ADD COLUMN     "lastPaymentDate_bs" TEXT;

-- AlterTable
ALTER TABLE "mb_account_details" ADD COLUMN     "maturityDate_bs" TEXT;

-- AlterTable
ALTER TABLE "user_account_statements" ADD COLUMN     "periodEndDate_bs" TEXT,
ADD COLUMN     "periodStartDate_bs" TEXT;

-- AlterTable
ALTER TABLE "user_account_transactions" ADD COLUMN     "transactionDate_bs" TEXT;

-- AlterTable
ALTER TABLE "user_accounts" ADD COLUMN     "lastInterestPostedDate_bs" TEXT,
ADD COLUMN     "lastTransactionDate_bs" TEXT,
ADD COLUMN     "openingDate_bs" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "dateOfBirth_bs" TEXT;

-- CreateTable
CREATE TABLE "fiscal_years" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDateBS" TEXT NOT NULL,
    "endDateBS" TEXT NOT NULL,
    "startDateAD" TIMESTAMP(3) NOT NULL,
    "endDateAD" TIMESTAMP(3) NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fiscal_years_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fiscal_years_name_key" ON "fiscal_years"("name");
