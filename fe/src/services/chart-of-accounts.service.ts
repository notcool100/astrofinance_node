import apiService from "./api";

export interface Account {
	id: string;
	accountCode: string;
	name: string;
	accountType: "ASSET" | "LIABILITY" | "EQUITY" | "INCOME" | "EXPENSE";
	parentId?: string | null;
	description?: string | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	children?: Account[];
}

export interface CreateAccountData {
	accountName: string;
	accountCode: string;
	accountType: "ASSET" | "LIABILITY" | "EQUITY" | "INCOME" | "EXPENSE";
	description?: string;
	parentAccountId?: string;
	isActive?: boolean;
}

export interface UpdateAccountData {
	accountName?: string;
	description?: string;
	parentAccountId?: string | null;
	isActive?: boolean;
}

// Get all accounts with optional filtering
export const getAllAccounts = async (
	type?: string,
	active?: boolean,
): Promise<Account[]> => {
	const params = new URLSearchParams();
	if (type) params.append("type", type);
	if (active !== undefined) params.append("active", active.toString());

	const response = await apiService.get<{
		success: boolean;
		message: string;
		data: Account[];
	}>(`/accounting/accounts?${params.toString()}`);
	return response.data || [];
};

// Get account by ID
export const getAccountById = async (id: string): Promise<Account> => {
	const response = await apiService.get<{
		success: boolean;
		message: string;
		data: Account;
	}>(`/accounting/accounts/${id}`);
	if (!response || !response.data) {
		throw new Error("Account not found");
	}
	return response.data;
};

// Create new account
export const createAccount = async (
	data: CreateAccountData,
): Promise<Account> => {
	const response = await apiService.post<{
		success: boolean;
		message: string;
		data: Account;
	}>("/accounting/accounts", data);
	if (!response || !response.data) {
		throw new Error("Failed to create account");
	}
	return response.data;
};

// Update account
export const updateAccount = async (
	id: string,
	data: UpdateAccountData,
): Promise<Account> => {
	const response = await apiService.put<{
		success: boolean;
		message: string;
		data: Account;
	}>(`/accounting/accounts/${id}`, data);
	if (!response || !response.data) {
		throw new Error("Failed to update account");
	}
	return response.data;
};

// Delete account
export const deleteAccount = async (id: string): Promise<void> => {
	await apiService.delete<{ success: boolean; message: string }>(
		`/accounting/accounts/${id}`,
	);
};

// Get account structure (hierarchical)
export const getAccountStructure = async (
	type?: string,
	active?: boolean,
): Promise<Account[]> => {
	const params = new URLSearchParams();
	if (type) params.append("type", type);
	if (active !== undefined) params.append("active", active.toString());

	const url = `/accounting/accounts/structure${params.toString() ? `?${params.toString()}` : ""}`;
	const response = await apiService.get<{
		success: boolean;
		message: string;
		data: Account[];
	}>(url);
	return response.data || [];
};

const chartOfAccountsService = {
	getAllAccounts,
	getAccountById,
	createAccount,
	updateAccount,
	deleteAccount,
	getAccountStructure,
};

export default chartOfAccountsService;
