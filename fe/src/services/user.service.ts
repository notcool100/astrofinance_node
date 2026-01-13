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

const userService = {
	// Create a new user
	create: (data: CreateUserData) =>
		apiService.post<User>("/user/users", data),

	// Get a user by ID
	getById: (id: string) => apiService.get<User>(`/user/users/${id}`),

	// Update a user
	update: (id: string, data: UpdateUserData) =>
		apiService.put<User>(`/user/users/${id}`, data),

	// Delete a user
	delete: (id: string) => apiService.delete(`/user/users/${id}`),

	// Upload a single user document
	uploadDocument: (userId: string, formData: FormData) =>
		apiService.upload<{ message: string; document: UserDocument }>(
			`/user/users/${userId}/documents`,
			formData,
		),

	// Upload multiple user documents
	uploadMultipleDocuments: (userId: string, formData: FormData) =>
		apiService.upload<{ message: string; documents: UserDocument[] }>(
			`/user/users/${userId}/documents/multiple`,
			formData,
		),

	// Get all documents for a user
	getUserDocuments: (userId: string) =>
		apiService.get<{ documents: UserDocument[] }>(
			`/user/users/${userId}/documents`,
		),

	// Delete a user document
	deleteUserDocument: (documentId: string) =>
		apiService.delete(`/user/documents/${documentId}`),
};

// Named exports for backward compatibility
export const getAllUsers = async (
	page = 1,
	limit = 10,
	search?: string,
	status?: string,
): Promise<any> => {
	const params = new URLSearchParams();
	params.append("page", page.toString());
	params.append("limit", limit.toString());

	if (search) params.append("search", search);
	if (status) params.append("status", status);

	return apiService.get<any>(`/user/users?${params.toString()}`);
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

export default userService;
