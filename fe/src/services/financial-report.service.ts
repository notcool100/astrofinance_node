import api from "./api";
import axios from "axios";

const API_URL =
	process.env.NEXT_PUBLIC_API_URL || "http://82.180.144.91:5001/api";

export interface AccountBalance {
	account: {
		id: string;
		accountCode: string;
		name: string;
		accountType: string;
		description?: string;
		isActive: boolean;
		parentId?: string;
	};
	balance: number;
	period: {
		startDate?: string;
		endDate?: string;
	};
}

export interface TrialBalanceAccount {
	id: string;
	accountCode: string;
	name: string;
	accountType: string;
	balance: number;
	isActive: boolean;
	parentId?: string;
	description?: string;
}

export interface TrialBalance {
	asOfDate: string;
	accounts: TrialBalanceAccount[];
	totals: {
		debit: number;
		credit: number;
		difference: number;
	};
}

export interface IncomeStatementAccount {
	id: string;
	accountCode: string;
	name: string;
	accountType: string;
	balance: number;
	isActive: boolean;
	parentId?: string;
	description?: string;
}

export interface IncomeStatement {
	period: {
		startDate: string;
		endDate: string;
	};
	incomeAccounts: IncomeStatementAccount[];
	expenseAccounts: IncomeStatementAccount[];
	totalIncome: number;
	totalExpenses: number;
	netIncome: number;
}

export interface BalanceSheetAccount {
	id: string;
	accountCode: string;
	name: string;
	accountType: string;
	balance: number;
	isActive: boolean;
	parentId?: string;
	description?: string;
}

export interface BalanceSheet {
	asOfDate: string;
	assetAccounts: BalanceSheetAccount[];
	liabilityAccounts: BalanceSheetAccount[];
	equityAccounts: BalanceSheetAccount[];
	totalAssets: number;
	totalLiabilities: number;
	totalEquity: number;
	liabilitiesAndEquity: number;
}

export interface GeneralLedgerEntry {
	entryDate: string;
	entryNumber: string;
	reference?: string;
	narration: string;
	debitAmount: number;
	creditAmount: number;
	debitAccounts: {
		id: string;
		accountCode: string;
		name: string;
		accountType: string;
	}[];
	creditAccounts: {
		id: string;
		accountCode: string;
		name: string;
		accountType: string;
	}[];
}

export interface GeneralLedger {
	period: {
		startDate?: string;
		endDate?: string;
	};
	account?: {
		id: string;
		accountCode: string;
		name: string;
		accountType: string;
	};
	openingBalance: number;
	entries: GeneralLedgerEntry[];
}

class FinancialReportService {
	/**
	 * Get account balance
	 */
	async getAccountBalance(
		accountId: string,
		startDate?: string,
		endDate?: string,
	): Promise<AccountBalance> {
		const params = new URLSearchParams();
		if (startDate) params.append("startDate", startDate);
		if (endDate) params.append("endDate", endDate);

		const response = await api.get(
			`/accounting/reports/accounts/${accountId}/balance?${params.toString()}`,
		);
		return (response as { data: AccountBalance }).data;
	}

	/**
	 * Get trial balance
	 */
	async getTrialBalance(asOfDate?: string): Promise<TrialBalance> {
		const params = new URLSearchParams();
		if (asOfDate) params.append("asOfDate", asOfDate);

		try {
			// Make a direct axios call to ensure we get the raw response
			const response = await axios.get<TrialBalance>(
				`${API_URL}/accounting/reports/trial-balance?${params.toString()}`,
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);

			console.log("Direct trial balance API response:", response.data);
			return response.data;
		} catch (error) {
			console.error("Error in getTrialBalance:", error);
			throw error;
		}
	}

	/**
	 * Get income statement
	 */
	async getIncomeStatement(
		startDate?: string,
		endDate?: string,
	): Promise<IncomeStatement> {
		const params = new URLSearchParams();
		if (startDate) params.append("startDate", startDate);
		if (endDate) params.append("endDate", endDate);

		try {
			// Make a direct axios call to ensure we get the raw response
			const response = await axios.get(
				`${API_URL}/accounting/reports/income-statement?${params.toString()}`,
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);

			console.log("Direct income statement API response:", response.data);
			return response.data;
		} catch (error) {
			console.error("Error in getIncomeStatement:", error);
			throw error;
		}
	}

	/**
	 * Get balance sheet
	 */
	async getBalanceSheet(asOfDate?: string): Promise<BalanceSheet> {
		const params = new URLSearchParams();
		if (asOfDate) params.append("asOfDate", asOfDate);

		try {
			// Make a direct axios call to ensure we get the raw response
			const response = await axios.get(
				`${API_URL}/accounting/reports/balance-sheet?${params.toString()}`,
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);

			console.log("Direct balance sheet API response:", response.data);
			return response.data;
		} catch (error) {
			console.error("Error in getBalanceSheet:", error);
			throw error;
		}
	}

	/**
	 * Get general ledger
	 */
	async getGeneralLedger(
		accountId?: string,
		startDate?: string,
		endDate?: string,
	): Promise<GeneralLedger> {
		const params = new URLSearchParams();
		if (accountId) params.append("accountId", accountId);
		if (startDate) params.append("startDate", startDate);
		if (endDate) params.append("endDate", endDate);

		try {
			// Make a direct axios call to ensure we get the raw response
			const response = await axios.get(
				`${API_URL}/accounting/reports/general-ledger?${params.toString()}`,
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
					timeout: 10000, // 10 second timeout
				},
			);

			console.log("Direct general ledger API response:", response.data);

			// Create a default response if the API returns nothing
			if (!response.data) {
				console.warn("API returned empty data, creating default response");
				return {
					period: {
						startDate,
						endDate,
					},
					openingBalance: 0,
					entries: [],
				};
			}

			return response.data;
		} catch (error) {
			console.error("Error in getGeneralLedger:", error);

			// Return a default response instead of throwing an error
			console.warn("Returning default general ledger due to API error");
			return {
				period: {
					startDate,
					endDate,
				},
				openingBalance: 0,
				entries: [],
			};
		}
	}

	/**
	 * Export report to PDF/Excel
	 */
	async exportReport(
		reportType:
			| "balance-sheet"
			| "income-statement"
			| "trial-balance"
			| "general-ledger",
		format: "pdf" | "excel",
		params: Record<string, string>,
	): Promise<Blob> {
		const queryParams = new URLSearchParams();
		Object.entries(params).forEach(([key, value]) => {
			if (value) queryParams.append(key, value);
		});
		queryParams.append("format", format);

		const response = (await api.get(
			`/accounting/reports/export/${reportType}?${queryParams.toString()}`,
			{
				responseType: "blob",
			},
		)) as { data: Blob };

		return response.data;
	}
}

export default new FinancialReportService();
