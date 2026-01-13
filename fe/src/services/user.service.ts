import apiService from "./api";

// Types
export interface User {
	id: string;
	fullName: string;
	dateOfBirth?: string;
	dateOfBirth_bs?: string;
	gender?: string;
	contactNumber: string;
	email: string;
	address?: string;
	idNumber?: string;
	idType?: string;
	userType?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CreateUserData {
	fullName: string;
	dateOfBirth?: string;
	dateOfBirth_bs?: string;
	gender?: string;
	contactNumber: string;
	email?: string;
	address?: string;
	identificationNumber?: string;
	identificationType?: string;
	isActive?: boolean;
}

export interface UpdateUserData {
	fullName?: string;
	dateOfBirth?: string;
	dateOfBirth_bs?: string;
	gender?: string;
	contactNumber?: string;
	email?: string;
	address?: string;
	identificationNumber?: string;
	identificationType?: string;
	isActive?: boolean;
}

export interface UserDocument {
	id: string;
	userId: string;
	documentType: string;
	fileName: string;
	filePath: string;
	fileUrl: string;
	uploadDate: string;
	createdAt: string;
	updatedAt: string;
}

export interface UserLoan {
	id: string;
	accountNumber: string;
	loanType?: {
		id: string;
		name: string;
	};
	amount: number;
	disbursementDate: string;
	status: string;
	createdAt: string;
	updatedAt: string;
}

export interface UserLoanApplication {
	id: string;
	applicationNumber: string;
	loanType?: {
		id: string;
		name: string;
	};
	amount: number;
	appliedDate: string;
	status: string;
	createdAt: string;
	updatedAt: string;
}

export interface UserAccount {
	id: string;
	accountNumber: string;
	userId: string;
	balance: number;
	interestRate: number;
	accruedInterest: number;
	openingDate: string;
	status: string;
	accountType: string;
	bbAccountDetails?: any;
	mbAccountDetails?: any;
	createdAt: string;
	updatedAt: string;
}

export type Account = UserAccount;

export interface CreateAccountData {
	userId: string;
	accountType: string;
	interestRate: number;
	openingDate: string;
	balance?: number;
	bbAccountDetails?: any;
	mbAccountDetails?: any;
}

export interface UpdateAccountData {
	interestRate?: number;
	status?: string;
	bbAccountDetails?: any;
	mbAccountDetails?: any;
}

// Named exports
export const getAllUsers = async (
	page = 1,
	limit = 10,
	search?: string,
	status?: string,
): Promise<{ data: User[]; pagination: any }> => {
	const params = new URLSearchParams();
	params.append("page", page.toString());
	params.append("limit", limit.toString());

	if (search) params.append("search", search);
	if (status) params.append("status", status);

	return apiService.get<{ data: User[]; pagination: any }>(`/user/users?${params.toString()}`);
};

export const getUserById = async (id: string): Promise<User> => {
	return apiService.get<User>(`/user/users/${id}`);
};

export const createUser = async (data: CreateUserData): Promise<User> => {
	return apiService.post<User>("/user/users", data);
};

export const updateUser = async (
	id: string,
	data: UpdateUserData,
): Promise<User> => {
	return apiService.put<User>(`/user/users/${id}`, data);
};

export const deleteUser = async (id: string): Promise<{ message: string }> => {
	return apiService.delete<{ message: string }>(`/user/users/${id}`);
};

// Document methods (extracted from old userService object)
export const uploadUserDocument = (userId: string, formData: FormData) =>
	apiService.upload<{ message: string; document: UserDocument }>(
		`/user/users/${userId}/documents`,
		formData,
	);

export const uploadUserMultipleDocuments = (userId: string, formData: FormData) =>
	apiService.upload<{ message: string; documents: UserDocument[] }>(
		`/user/users/${userId}/documents/multiple`,
		formData,
	);

export const getUserDocuments = (userId: string) =>
	apiService.get<{ documents: UserDocument[] }>(
		`/user/users/${userId}/documents`,
	);

export const deleteUserDocument = (documentId: string) =>
	apiService.delete(`/user/documents/${documentId}`);

export const getUserLoans = async (userId: string): Promise<{ data: UserLoan[] }> => {
	return apiService.get<{ data: UserLoan[] }>(`/user/users/${userId}/loans`);
};

export const getUserLoanApplications = async (userId: string): Promise<{ data: UserLoanApplication[] }> => {
	return apiService.get<{ data: UserLoanApplication[] }>(`/user/users/${userId}/loan-applications`);
};

export const getAllAccounts = async (
	page = 1,
	limit = 10,
	search = "",
	accountType = "",
	status = "",
): Promise<{ data: UserAccount[]; pagination: { pages: number; total: number } }> => {
	const params = new URLSearchParams({
		page: page.toString(),
		limit: limit.toString(),
		search,
		accountType,
		status,
	});
	return apiService.get<{
		data: UserAccount[];
		pagination: { pages: number; total: number };
	}>(`/user/accounts?${params.toString()}`);
};

export const getAccountById = async (id: string): Promise<UserAccount> => {
	return apiService.get<UserAccount>(`/user/accounts/${id}`);
};

export const createAccount = async (data: CreateAccountData): Promise<UserAccount> => {
	return apiService.post<UserAccount>("/user/accounts", data);
};

export const updateAccount = async (id: string, data: UpdateAccountData): Promise<UserAccount> => {
	return apiService.put<UserAccount>(`/user/accounts/${id}`, data);
};

// Default export object aggregating all functionality
const userService = {
	// CRUD
	create: createUser,
	getById: getUserById,
	update: updateUser,
	delete: deleteUser,
	getAllUsers,

	// Documents (preserving old method names)
	uploadDocument: uploadUserDocument,
	uploadMultipleDocuments: uploadUserMultipleDocuments,
	getUserDocuments,
	deleteUserDocument,

	// Additional Features
	getUserLoans,
	getUserLoanApplications,

	// Accounts
	getAllAccounts,
	getAccountById,
	createAccount,
	updateAccount
};

export default userService;
