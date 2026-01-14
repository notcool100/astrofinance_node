import apiService from "./api";

export interface LoanProvision {
    id: string;
    loanId: string;
    classification: "GOOD" | "SUBSTANDARD" | "DOUBTFUL" | "BAD";
    overdueDays: number;
    provisionPercent: number;
    provisionAmount: number;
    provisionDate: string;
    loan?: {
        loanNumber: string;
        user?: {
            fullName: string;
        }
    }
}

export interface LLPReport {
    summary: {
        GOOD: { count: number, amount: number, provision: number };
        SUBSTANDARD: { count: number, amount: number, provision: number };
        DOUBTFUL: { count: number, amount: number, provision: number };
        BAD: { count: number, amount: number, provision: number };
        totalProvision: number;
    };
    details: LoanProvision[];
}

export const generateProvisions = async (): Promise<{ message: string, count: number }> => {
    const result = await apiService.post<{
        success: boolean;
        message: string;
    }>("/accounting/llp/generate", {});
    return { message: result.message, count: 0 };
};

export const getLLPReport = async (): Promise<LLPReport> => {
    const result = await apiService.get<{
        success: boolean;
        data: LLPReport;
    }>("/accounting/llp/report");
    return result.data;
};

const llpService = {
    generateProvisions,
    getLLPReport
};

export default llpService;
