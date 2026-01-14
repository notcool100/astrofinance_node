import api from "./api";

export interface AccountType {
    id: string;
    code: string;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAccountTypeData {
    code: string;
    name: string;
    description?: string;
    isActive?: boolean;
}

export interface UpdateAccountTypeData {
    name?: string;
    description?: string;
    isActive?: boolean;
}

class AccountTypeService {
    /**
     * Get all account types
     */
    async getAllAccountTypes(includeInactive = false): Promise<AccountType[]> {
        const params = includeInactive ? "?includeInactive=true" : "";
        const response = await api.get<AccountType[]>(`/user/account-types${params}`);
        return response;
    }

    /**
     * Get account type by ID
     */
    async getAccountTypeById(id: string): Promise<AccountType> {
        const response = await api.get<AccountType>(`/user/account-types/${id}`);
        return response;
    }

    /**
     * Create new account type
     */
    async createAccountType(data: CreateAccountTypeData): Promise<AccountType> {
        const response = await api.post<AccountType>("/user/account-types", data);
        return response;
    }

    /**
     * Update account type
     */
    async updateAccountType(
        id: string,
        data: UpdateAccountTypeData,
    ): Promise<AccountType> {
        const response = await api.put<AccountType>(
            `/user/account-types/${id}`,
            data,
        );
        return response;
    }

    /**
     * Delete account type (soft delete)
     */
    async deleteAccountType(id: string): Promise<AccountType> {
        const response = await api.delete<AccountType>(`/user/account-types/${id}`);
        return response;
    }
}

export default new AccountTypeService();
