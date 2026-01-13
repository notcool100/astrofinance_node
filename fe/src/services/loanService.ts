import apiService from "./api";
import { LoanCalculatorPreset, LoanCalculatorHistory } from "@/types/loan";

export interface LoanType {
	id: string;
	name: string;
	code: string;
	interestType: "FLAT" | "DIMINISHING";
	minAmount: number;
	maxAmount: number;
	minTenure: number;
	maxTenure: number;
	interestRate: number;
	processingFeePercent: number;
	lateFeeAmount: number;
	isActive: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export interface LoanApplication {
	id: string;
	applicationNumber: string;
	userId: string;
	loanTypeId: string;
	amount: number;
	tenure: number;
	purpose: string;
	status: "PENDING" | "APPROVED" | "REJECTED" | "DISBURSED";
	appliedDate: string;
	approvedDate?: string;
	approvedById?: string;
	rejectionReason?: string;
	createdAt: string;
	updatedAt: string;
	user?: {
		id: string;
		fullName: string;
		email?: string;
		contactNumber: string;
	};
	// Legacy field for compatibility
	applicationDate?: string;
	notes?: string;
	loanType?: LoanType;
	approvedBy?: {
		id: string;
		firstName: string;
		lastName: string;
	};
}

export interface Loan {
	id: string;
	loanNumber: string;
	userId: string;
	applicationId: string;
	amount: number;
	tenure: number;
	interestRate: number;
	interestType: "FLAT" | "DIMINISHING";
	emi: number;
	disbursementDate: string;
	status: "ACTIVE" | "CLOSED" | "DEFAULTED" | "WRITTEN_OFF";
	closureDate?: string;
	loanType?: LoanType;
}

export interface LoanPayment {
	id: string;
	loanId: string;
	amount: number;
	paymentDate: string;
	paymentMethod: "CASH" | "BANK_TRANSFER" | "CHEQUE" | "ONLINE";
	reference?: string;
	status: "PENDING" | "COMPLETED" | "FAILED";
}

export interface LoanSchedule {
	installmentNumber: number;
	dueDate: string;
	principal: number;
	interest: number;
	amount: number;
	balance: number;
	status: "PENDING" | "PAID" | "OVERDUE";
	paymentId?: string;
}

export interface LoanDocument {
	id: string;
	loanApplicationId: string;
	documentType: string;
	documentName: string;
	documentUrl: string;
	uploadDate: string;
	status?: "PENDING" | "UPLOADED" | "VERIFIED" | "REJECTED";
	verificationDate?: string | null;
	verificationNotes?: string | null;
}

export interface EMICalculationResult {
	emi: number;
	totalInterest: number;
	totalAmount: number;
}

export interface LoanApplicationFormData {
	userId: string;
	loanTypeId: string;
	amount: number;
	tenure: number;
	purpose: string;
	employmentType: "SALARIED" | "SELF_EMPLOYED" | "BUSINESS" | "OTHER";
	monthlyIncome: number;
	existingEmi: number;
}

export interface LoanPaymentFormData {
	amount: number;
	paymentDate: string;
	paymentMethod: "CASH" | "BANK_TRANSFER" | "CHEQUE" | "ONLINE";
	reference?: string;
}

export interface CalculatorFormData {
	loanTypeId: string;
	amount: number;
	tenure: number;
	interestRate: number;
	interestType: "FLAT" | "DIMINISHING";
	startDate: string;
}

const loanService = {
	// Loan Types
	getLoanTypes: (params?: {
		active?: boolean;
		interestType?: string;
		minInterestRate?: number;
		maxInterestRate?: number;
		search?: string;
		page?: number;
		limit?: number;
		sortBy?: string;
		sortOrder?: string;
	}) =>
		apiService.get<{ data: LoanType[]; pagination: any }>(
			"/loan/types",
			params,
		),

	getLoanTypeById: (id: string) =>
		apiService.get<LoanType>(`/loan/types/${id}`),

	createLoanType: (data: {
		name: string;
		code: string;
		interestType: "FLAT" | "DIMINISHING";
		minAmount: number;
		maxAmount: number;
		minTenure: number;
		maxTenure: number;
		interestRate: number;
		processingFeePercent: number;
		lateFeeAmount: number;
		isActive: boolean;
	}) => apiService.post<LoanType>("/loan/types", data),

	updateLoanType: (
		id: string,
		data: {
			name?: string;
			interestType?: "FLAT" | "DIMINISHING";
			minAmount?: number;
			maxAmount?: number;
			minTenure?: number;
			maxTenure?: number;
			interestRate?: number;
			processingFeePercent?: number;
			lateFeeAmount?: number;
			isActive?: boolean;
		},
	) => apiService.put<LoanType>(`/loan/types/${id}`, data),

	deleteLoanType: (id: string) => apiService.delete(`/loan/types/${id}`),

	// Loan Applications
	getLoanApplications: (params?: {
		status?: string;
		loanType?: string;
		startDate?: string;
		endDate?: string;
		page?: number;
		limit?: number;
	}) =>
		apiService.get<{
			data: LoanApplication[];
			pagination: any;
			totalAmount: number;
		}>("/loan/applications", params),

	getLoanApplicationById: (id: string) =>
		apiService.get<LoanApplication>(`/loan/applications/${id}`),

	createLoanApplication: (data: LoanApplicationFormData) =>
		apiService.post<LoanApplication>("/loan/applications", data),

	updateLoanApplicationStatus: (
		id: string,
		data: { status: string; rejectionReason?: string },
	) => apiService.put<LoanApplication>(`/loan/applications/${id}/status`, data),

	uploadLoanDocument: (id: string, formData: FormData) =>
		apiService.upload<LoanDocument>(
			`/loan/documents/application/${id}`,
			formData,
		),

	uploadMultipleDocuments: async (id: string, formData: FormData) => {
		// Extract files and metadata from formData
		const files = formData.getAll("files") as File[];
		const documentTypes = formData.getAll("documentTypes") as string[];
		const documentNames = formData.getAll("documentNames") as string[];

		const uploadPromises = files.map((file, index) => {
			const singleFormData = new FormData();
			singleFormData.append("document", file);
			singleFormData.append("documentType", documentTypes[index]);
			singleFormData.append("documentName", documentNames[index]);

			return apiService.upload<LoanDocument>(
				`/loan/documents/application/${id}`,
				singleFormData,
			);
		});

		return Promise.all(uploadPromises);
	},

	getLoanDocuments: (id: string) =>
		apiService.get<LoanDocument[]>(`/loan/documents/application/${id}`),

	verifyLoanDocument: (
		id: string,
		data: { status: string; verificationNotes: string },
	) => apiService.put<LoanDocument>(`/loan/documents/verify/${id}`, data),

	deleteLoanDocument: (id: string) =>
		apiService.delete(`/loan/documents/${id}`),

	submitDocuments: (id: string) =>
		apiService.post<LoanApplication>(
			`/loan/applications/${id}/submit-documents`,
			{},
		),

	// Loans
	getLoans: (params?: {
		status?: string;
		loanType?: string;
		startDate?: string;
		endDate?: string;
		page?: number;
		limit?: number;
	}) =>
		apiService.get<{ data: Loan[]; pagination: any }>("/loan/loans", params),

	getLoanById: (id: string) => apiService.get<Loan>(`/loan/loans/${id}`),

	getLoanSchedule: (id: string) =>
		apiService.get<LoanSchedule[]>(`/loan/loans/${id}/schedule`),

	getLoanPayments: (id: string) =>
		apiService.get<LoanPayment[]>(`/loan/loans/${id}/payments`),

	disburseLoan: (data: {
		applicationId: string;
		disbursementDate: string;
		disbursementMethod: string;
		accountNumber?: string;
	}) => apiService.post<Loan>("/loan/loans/disburse", data),

	recordLoanPayment: (id: string, data: LoanPaymentFormData) =>
		apiService.post<LoanPayment>(`/loan/loans/${id}/payments`, data),

	calculateSettlement: (id: string, data: { settlementDate: string }) =>
		apiService.post<{
			outstandingPrincipal: number;
			interestDue: number;
			fees: number;
			penalties: number;
			totalSettlementAmount: number;
		}>(`/loan/loans/${id}/calculate-settlement`, data),

	settleLoan: (
		id: string,
		data: {
			settlementDate: string;
			amount: number;
			paymentMethod: string;
			reference?: string;
		},
	) => apiService.post<Loan>(`/loan/loans/${id}/settle`, data),

	// Loan Calculator
	calculateEMI: (data: {
		amount: number;
		tenure: number;
		interestRate: number;
		interestType: "FLAT" | "DIMINISHING";
	}) => apiService.post<EMICalculationResult>("/loan/calculator/emi", {
		principal: data.amount,
		tenure: data.tenure,
		interestRate: data.interestRate,
		interestType: data.interestType
	}),

	generateSchedule: (data: CalculatorFormData) =>
		apiService.post<LoanSchedule[]>("/loan/calculator/schedule", {
			...data,
			principal: data.amount
		}),

	compareInterestMethods: (data: {
		amount: number;
		tenure: number;
		interestRate: number;
	}) =>
		apiService.post<{
			flat: { emi: number; totalInterest: number; totalAmount: number };
			diminishing: { emi: number; totalInterest: number; totalAmount: number };
			difference: { emi: number; totalInterest: number; totalAmount: number };
			recommendation: string;
		}>("/loan/calculator/compare-methods", {
			principal: data.amount,
			tenure: data.tenure,
			interestRate: data.interestRate,
		}),

	// Calculator presets
	getUserCalculatorPresets: (userId: string) =>
		apiService.get<LoanCalculatorPreset[]>(
			`/loan/calculator-presets/user/${userId}`,
		),

	getCalculatorPreset: (id: string) =>
		apiService.get<LoanCalculatorPreset>(`/loan/calculator-presets/${id}`),

	createCalculatorPreset: (data: {
		name: string;
		userId: string;
		loanTypeId?: string;
		amount: number;
		tenure: number;
		interestRate: number;
		interestType: "FLAT" | "DIMINISHING";
		startDate: string;
		isDefault?: boolean;
	}) => apiService.post<LoanCalculatorPreset>("/loan/calculator-presets", data),

	updateCalculatorPreset: (
		id: string,
		data: {
			name?: string;
			loanTypeId?: string;
			amount?: number;
			tenure?: number;
			interestRate?: number;
			interestType?: "FLAT" | "DIMINISHING";
			startDate?: string;
			isDefault?: boolean;
		},
	) =>
		apiService.put<LoanCalculatorPreset>(
			`/loan/calculator-presets/${id}`,
			data,
		),

	deleteCalculatorPreset: (id: string) =>
		apiService.delete(`/loan/calculator-presets/${id}`),

	// Calculator history
	getUserCalculationHistory: (userId: string, page = 1, limit = 10) =>
		apiService.get<{
			data: LoanCalculatorHistory[];
			pagination: {
				total: number;
				page: number;
				limit: number;
				pages: number;
			};
		}>(`/loan/calculator-history/user/${userId}?page=${page}&limit=${limit}`),

	getUserCalculationStats: (userId: string) =>
		apiService.get<{
			totalCalculations: number;
			averages: {
				amount: number;
				tenure: number;
				interestRate: number;
				emi: number;
				totalInterest: number;
			};
			maximums: {
				amount: number;
				tenure: number;
				interestRate: number;
				emi: number;
				totalInterest: number;
			};
			minimums: {
				amount: number;
				tenure: number;
				interestRate: number;
				emi: number;
				totalInterest: number;
			};
			mostUsedLoanType: {
				id: string;
				name: string;
				code: string;
			} | null;
			mostUsedInterestType: string | null;
		}>(`/loan/calculator-history/user/${userId}/stats`),

	recordCalculation: (data: {
		userId: string;
		loanTypeId?: string;
		amount: number;
		tenure: number;
		interestRate: number;
		interestType: "FLAT" | "DIMINISHING";
		emi: number;
		totalInterest: number;
		totalAmount: number;
	}) =>
		apiService.post<LoanCalculatorHistory>("/loan/calculator-history", data),

	clearUserCalculationHistory: (userId: string) =>
		apiService.delete(`/loan/calculator-history/user/${userId}`),
};

export default loanService;
