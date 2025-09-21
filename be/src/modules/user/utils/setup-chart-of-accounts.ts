/**
 * Setup script to create basic chart of accounts required for user transactions
 */

import prisma from "../../../config/database";
import { AccountType_COA } from "@prisma/client";

// Basic chart of accounts required for user transactions
const basicAccounts = [
	// Asset Accounts
	{
		accountCode: "1001",
		name: "CASH",
		accountType: AccountType_COA.ASSET,
		description: "Cash on hand and in bank",
	},
	{
		accountCode: "1002",
		name: "BANK",
		accountType: AccountType_COA.ASSET,
		description: "Bank accounts",
	},

	// Liability Accounts
	{
		accountCode: "2001",
		name: "USER_DEPOSITS",
		accountType: AccountType_COA.LIABILITY,
		description: "Customer deposits and savings",
	},
	{
		accountCode: "2002",
		name: "LOANS_PAYABLE",
		accountType: AccountType_COA.LIABILITY,
		description: "Loans payable to customers",
	},

	// Income Accounts
	{
		accountCode: "4001",
		name: "FEE_INCOME",
		accountType: AccountType_COA.INCOME,
		description: "Fee income from customers",
	},
	{
		accountCode: "4002",
		name: "INTEREST_INCOME",
		accountType: AccountType_COA.INCOME,
		description: "Interest income from loans",
	},
	{
		accountCode: "4003",
		name: "OTHER_INCOME",
		accountType: AccountType_COA.INCOME,
		description: "Other miscellaneous income",
	},
	{
		accountCode: "4004",
		name: "ADJUSTMENT_INCOME",
		accountType: AccountType_COA.INCOME,
		description: "Income from adjustments",
	},

	// Expense Accounts
	{
		accountCode: "5001",
		name: "INTEREST_EXPENSE",
		accountType: AccountType_COA.EXPENSE,
		description: "Interest expense paid to customers",
	},
	{
		accountCode: "5002",
		name: "FEE_EXPENSE",
		accountType: AccountType_COA.EXPENSE,
		description: "Fee expenses",
	},
];

/**
 * Create basic chart of accounts
 */
export const setupChartOfAccounts = async () => {
	console.log("Setting up basic chart of accounts...\n");

	const results = [];

	for (const account of basicAccounts) {
		try {
			// Check if account already exists
			const existingAccount = await prisma.account_COA.findFirst({
				where: {
					OR: [{ accountCode: account.accountCode }, { name: account.name }],
				},
			});

			if (existingAccount) {
				console.log(
					`✅ Account already exists: ${account.name} (${account.accountCode})`,
				);
				results.push({
					accountCode: account.accountCode,
					name: account.name,
					status: "EXISTS",
					accountId: existingAccount.id,
				});
				continue;
			}

			// Create new account
			const newAccount = await prisma.account_COA.create({
				data: account,
			});

			console.log(
				`✅ Created account: ${account.name} (${account.accountCode}) - ${newAccount.id}`,
			);
			results.push({
				accountCode: account.accountCode,
				name: account.name,
				status: "CREATED",
				accountId: newAccount.id,
			});
		} catch (error) {
			console.error(`❌ Failed to create account ${account.name}:`, error);
			results.push({
				accountCode: account.accountCode,
				name: account.name,
				status: "FAILED",
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}

	// Summary
	console.log("\n=== SETUP SUMMARY ===");
	const createdCount = results.filter((r) => r.status === "CREATED").length;
	const existsCount = results.filter((r) => r.status === "EXISTS").length;
	const failedCount = results.filter((r) => r.status === "FAILED").length;

	console.log(`Total accounts: ${results.length}`);
	console.log(`Created: ${createdCount}`);
	console.log(`Already exists: ${existsCount}`);
	console.log(`Failed: ${failedCount}`);

	if (failedCount > 0) {
		console.log("\nFailed accounts:");
		results
			.filter((r) => r.status === "FAILED")
			.forEach((result) => {
				console.log(`- ${result.name}: ${result.error}`);
			});
	}

	return results;
};

/**
 * Verify that all required accounts exist
 */
export const verifyRequiredAccounts = async () => {
	console.log("Verifying required accounts for user transactions...\n");

	const requiredAccounts = [
		"CASH",
		"USER_DEPOSITS",
		"INTEREST_EXPENSE",
		"FEE_INCOME",
		"ADJUSTMENT_INCOME",
	];

	const results = [];

	for (const accountName of requiredAccounts) {
		const account = await prisma.account_COA.findFirst({
			where: {
				name: accountName,
				isActive: true,
			},
		});

		if (account) {
			console.log(
				`✅ Found: ${accountName} (${account.accountCode}) - ${account.id}`,
			);
			results.push({
				name: accountName,
				status: "FOUND",
				accountId: account.id,
				accountCode: account.accountCode,
			});
		} else {
			console.log(`❌ Missing: ${accountName}`);
			results.push({
				name: accountName,
				status: "MISSING",
			});
		}
	}

	const foundCount = results.filter((r) => r.status === "FOUND").length;
	const missingCount = results.filter((r) => r.status === "MISSING").length;

	console.log(`\nVerification Summary:`);
	console.log(`Found: ${foundCount}`);
	console.log(`Missing: ${missingCount}`);

	if (missingCount > 0) {
		console.log("\nMissing accounts:");
		results
			.filter((r) => r.status === "MISSING")
			.forEach((result) => {
				console.log(`- ${result.name}`);
			});
	}

	return results;
};

// Export for use in other files
export default {
	setupChartOfAccounts,
	verifyRequiredAccounts,
};
