import api from "./api";
import axios from "axios";

const API_URL =
	process.env.NEXT_PUBLIC_API_URL || "http://82.180.144.91:5001/api";

export interface Account {
	id: string;
	accountCode: string;
	name: string;
	accountType: string;
	description?: string;
	isActive: boolean;
	parentId?: string;
	createdAt: string;
	updatedAt: string;
}

class AccountService {
	/**
	 * Get all accounts
	 */
	async getAccounts(): Promise<any> {
		try {
			// Make a direct axios call to ensure we get the raw response
			const response = await axios.get(`${API_URL}/accounting/accounts`, {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});

			console.log("Direct accounts API response:", response.data);

			// Handle the specific response format you provided
			// Format: { success: true, message: "Accounts retrieved successfully", data: [...] }
			if (
				response.data &&
				response.data.success === true &&
				Array.isArray(response.data.data)
			) {
				console.log(
					"Detected success/data format with",
					response.data.data.length,
					"accounts",
				);
				return response.data;
			} else if (response.data && Array.isArray(response.data)) {
				// API returns array directly
				console.log(
					"Detected direct array format with",
					response.data.length,
					"accounts",
				);
				return { data: response.data };
			} else if (typeof response.data === "object") {
				// Try to extract any array we can find
				for (const key in response.data) {
					if (Array.isArray(response.data[key])) {
						console.log(
							"Found array in response at key:",
							key,
							"with",
							response.data[key].length,
							"items",
						);
						return { data: response.data[key] };
					}
				}
				// If we can't find an array, return an empty array
				console.warn(
					"Could not find any array in response, returning empty array",
				);
				return { data: [] };
			} else {
				// Fallback
				console.warn("Unrecognized response format, returning empty array");
				return { data: [] };
			}
		} catch (error) {
			console.error("Error in getAccounts:", error);
			throw error;
		}
	}

	/**
	 * Get account by ID
	 */
	async getAccount(id: string): Promise<Account> {
		const response = await api.get<any>(`/accounting/accounts/${id}`);
		return response.data.data as Account;
	}

	/**
	 * Create new account
	 */
	async createAccount(accountData: Partial<Account>): Promise<Account> {
		const response = await api.post<any>("/accounting/accounts", accountData);
		return response.data.data as Account;
	}

	/**
	 * Update account
	 */
	async updateAccount(
		id: string,
		accountData: Partial<Account>,
	): Promise<Account> {
		const response = await api.put<any>(
			`/accounting/accounts/${id}`,
			accountData,
		);
		return response.data.data as Account;
	}

	/**
	 * Get account types
	 */
	async getAccountTypes(): Promise<string[]> {
		const response = await api.get<any>("/accounting/accounts/types");
		return response.data.data as string[];
	}

	/**
	 * Get account balances
	 */
	async getAccountBalances(asOfDate?: string): Promise<Record<string, number>> {
		const params = new URLSearchParams();
		if (asOfDate) params.append("asOfDate", asOfDate);

		const response = await api.get<any>(
			`/accounting/accounts/balance?${params.toString()}`,
		);
		return response.data.data as Record<string, number>;
	}
}

export default new AccountService();
