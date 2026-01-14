import apiService from "./api";

export interface ShareAccount {
    id: string;
    userId: string;
    shareCount: number;
    totalAmount: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    transactions?: ShareTransaction[];
    certificates?: ShareCertificate[];
    user?: {
        id: string;
        fullName: string;
        email: string;
        contactNumber: string;
    }
}

export interface ShareTransaction {
    id: string;
    shareAccountId: string;
    transactionDate: string;
    transactionType: "PURCHASE" | "RETURN" | "DIVIDEND" | "TRANSFER_IN" | "TRANSFER_OUT";
    shareCount: number;
    amount: number;
    sharePrice: number;
    description?: string;
    certificateId?: string;
    createdById?: string;
}

export interface ShareCertificate {
    id: string;
    certificateNumber: string;
    shareAccountId: string;
    shareCount: number;
    amount: number;
    issuedDate: string;
    status: "GENERATED" | "PRINTED" | "CANCELLED";
    issuedById?: string;
}

export interface IssueShareData {
    userId: string;
    shareCount: number;
    amount: number;
    sharePrice?: number;
    description?: string;
}

export const getAllShareAccounts = async (): Promise<ShareAccount[]> => {
    const result = await apiService.get<{
        success: boolean;
        data: ShareAccount[];
    }>("/share");
    return result.data;
};

export const getShareAccount = async (userId: string): Promise<ShareAccount> => {
    const result = await apiService.get<{
        success: boolean;
        data: ShareAccount;
    }>(`/share/${userId}`);
    return result.data;
};

export const issueShares = async (data: IssueShareData): Promise<{
    account: ShareAccount;
    certificate: ShareCertificate;
    transaction: ShareTransaction;
}> => {
    const result = await apiService.post<{
        success: boolean;
        message: string;
        data: {
            account: ShareAccount;
            certificate: ShareCertificate;
            transaction: ShareTransaction;
        };
    }>("/share/issue", data);
    return result.data;
};

const shareService = {
    getAllShareAccounts,
    getShareAccount,
    issueShares
};

export default shareService;
