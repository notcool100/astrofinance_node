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
  processingFeePercent: number;
  lateFeeAmount: number;
  isActive: boolean;
}

export interface LoanCalculatorPreset {
  id: string;
  name: string;
  userId: string;
  loanTypeId?: string;
  amount: number;
  tenure: number;
  interestRate: number;
  interestType: 'FLAT' | 'DIMINISHING';
  startDate: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  loanType?: {
    id: string;
    name: string;
    code: string;
    interestRate: number;
    interestType: 'FLAT' | 'DIMINISHING';
  };
}

export interface LoanCalculatorHistory {
  id: string;
  userId: string;
  loanTypeId?: string;
  amount: number;
  tenure: number;
  interestRate: number;
  interestType: 'FLAT' | 'DIMINISHING';
  emi: number;
  totalInterest: number;
  totalAmount: number;
  calculatedAt: string;
  loanType?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface LoanSchedule {
  installmentNumber: number;
  dueDate: string;
  principal: number;
  interest: number;
  amount: number;
  balance: number;
}

export interface EMICalculationResult {
  principal: number;
  interestRate: number;
  tenure: number;
  interestType: 'FLAT' | 'DIMINISHING';
  emi: number;
  totalInterest: number;
  totalAmount: number;
}

export interface CalculatorFormData {
  loanTypeId: string;
  amount: number;
  tenure: number;
  interestRate: number;
  interestType: 'FLAT' | 'DIMINISHING';
  startDate: string;
}