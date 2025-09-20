/*
  Warnings:

  - The values [SAVINGS,LOAN,FIXED_DEPOSIT] on the enum `AccountType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AccountType_new" AS ENUM ('SB', 'BB', 'FD', 'SH', 'LS');
ALTER TABLE "user_accounts" ALTER COLUMN "accountType" TYPE "AccountType_new" USING ("accountType"::text::"AccountType_new");
ALTER TYPE "AccountType" RENAME TO "AccountType_old";
ALTER TYPE "AccountType_new" RENAME TO "AccountType";
DROP TYPE "AccountType_old";
COMMIT;

-- DropIndex
DROP INDEX "user_accounts_accountType_idx";

-- AlterTable
ALTER TABLE "user_account_transactions" ALTER COLUMN "transactionType" SET DEFAULT 'DEPOSIT';

-- AlterTable
ALTER TABLE "user_accounts" ALTER COLUMN "accountType" DROP NOT NULL;
