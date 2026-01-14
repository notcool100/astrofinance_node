/*
  Warnings:

  - The `accountType` column on the `user_accounts` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "user_accounts" ADD COLUMN     "accountTypeConfigId" TEXT,
DROP COLUMN "accountType",
ADD COLUMN     "accountType" TEXT;

-- AddForeignKey
ALTER TABLE "user_accounts" ADD CONSTRAINT "user_accounts_accountTypeConfigId_fkey" FOREIGN KEY ("accountTypeConfigId") REFERENCES "account_type_configs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
