import apiService from './api';

export interface LoanType {
  id: string;
  name: string;
  code: string;
  interestType: 'FLAT' | 'DIMINISHING';
  minAmount: number;
  maxAmount: number;
  minTenure: number;
  maxTenure: number;
  interestRate: number;
  isActive: boolean;
}

export interface LoanApplication {
  id: string;
  userId: string;
  loanTypeId: string;
  amount: number;
  tenure: number;
  purpose: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISBURSED';
  applicationDate: string;
  notes?: string;
  loanType?: LoanType;
}

export interface Loan {
  id: string;
  loanNumber: string;
  userId: string;
  applicationId: string;
  amount: number;
  tenure: number;
  interestRate: number;
  interestType: 'FLAT' | 'DIMINISHING';
  emi: number;
  disbursementDate: string;
  status: 'ACTIVE' | 'CLOSED' | 'DEFAULTED' | 'WRITTEN_OFF';
  closureDate?: string;
  loanType?: LoanType;
}

export interface LoanPayment {
  id: string;
  loanId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'ONLINE';
  reference?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
}

export interface LoanSchedule {
  installmentNumber: number;
  dueDate: string;
  principal: number;
  interest: number;
  amount: number;
  balance: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  paymentId?: string;
}

export interface LoanDocument {
  id: string;
  loanApplicationId: string;
  documentType: string;
  documentUrl: string;
  uploadDate: string;
}

export interface EMICalculationResult {
  emi: number;
  totalInterest: number;
  totalAmount: number;
}

export interface LoanApplicationFormData {
  loanTypeId: string;
  amount: number;
  tenure: number;
  purpose: string;
  employmentType: 'SALARIED' | 'SELF_EMPLOYED' | 'BUSINESS' | 'OTHER';
  monthlyIncome: number;
  existingEmi: number;
}

export interface LoanPaymentFormData {
  amount: number;
  paymentDate: string;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'ONLINE';
  reference?: string;
}

export interface CalculatorFormData {
  loanTypeId: string;
  amount: number;
  tenure: number;
  interestRate: number;
  interestType: 'FLAT' | 'DIMINISHING';
  startDate: string;
}

const loanService = {
  // Loan Types
  getLoanTypes: () => 
    apiService.get<LoanType[]>('/loan/types'),
  
  getLoanTypeById: (id: string) => 
    apiService.get<LoanType>(`/loan/types/${id}`),
  
  // Loan Applications
  getLoanApplications: (params?: { 
    status?: string; 
    loanType?: string; 
    startDate?: string; 
    endDate?: string; 
    page?: number; 
    limit?: number; 
  }) => 
    apiService.get<{ data: LoanApplication[]; pagination: any }>('/loan/applications', params),
  
  getLoanApplicationById: (id: string) => 
    apiService.get<LoanApplication>(`/loan/applications/${id}`),
  
  createLoanApplication: (data: LoanApplicationFormData) => 
    apiService.post<LoanApplication>('/loan/applications', data),
  
  updateLoanApplicationStatus: (id: string, data: { status: string; notes?: string }) => 
    apiService.put<LoanApplication>(`/loan/applications/${id}/status`, data),
  
  uploadLoanDocument: (id: string, formData: FormData) => 
    apiService.upload<LoanDocument>(`/loan/applications/${id}/documents`, formData),
  
  // Loans
  getLoans: (params?: { 
    status?: string; 
    loanType?: string; 
    startDate?: string; 
    endDate?: string; 
    page?: number; 
    limit?: number; 
  }) => 
    apiService.get<{ data: Loan[]; pagination: any }>('/loan/loans', params),
  
  getLoanById: (id: string) => 
    apiService.get<Loan>(`/loan/loans/${id}`),
  
  getLoanSchedule: (id: string) => 
    apiService.get<LoanSchedule[]>(`/loan/loans/${id}/schedule`),
  
  disburseLoan: (data: { 
    applicationId: string; 
    disbursementDate: string; 
    disbursementMethod: string; 
    accountNumber?: string; 
  }) => 
    apiService.post<Loan>('/loan/loans/disburse', data),
  
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
  
  settleLoan: (id: string, data: { 
    settlementDate: string; 
    amount: number; 
    paymentMethod: string; 
    reference?: string; 
  }) => 
    apiService.post<Loan>(`/loan/loans/${id}/settle`, data),
  
  // Loan Calculator
  calculateEMI: (data: { 
    amount: number; 
    tenure: number; 
    interestRate: number; 
    interestType: 'FLAT' | 'DIMINISHING'; 
  }) => 
    apiService.post<EMICalculationResult>('/loan/calculator/emi', data),
  
  generateSchedule: (data: CalculatorFormData) => 
    apiService.post<LoanSchedule[]>('/loan/calculator/schedule', data),
};

export default loanService;