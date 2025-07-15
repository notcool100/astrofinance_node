import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import apiService from '@/services/api';

interface LoanType {
  id: string;
  name: string;
  code: string;
  interestType: 'FLAT' | 'DIMINISHING';
  minAmount: number;
  maxAmount: number;
  minTenure: number;
  maxTenure: number;
  interestRate: number;
}

interface CalculatorFormData {
  loanTypeId: string;
  amount: number;
  tenure: number;
  interestRate: number;
  interestType: 'FLAT' | 'DIMINISHING';
  startDate: string;
}

interface EMICalculationResult {
  emi: number;
  totalInterest: number;
  totalAmount: number;
}

interface InstallmentSchedule {
  installmentNumber: number;
  dueDate: string;
  principal: number;
  interest: number;
  amount: number;
  balance: number;
}

const calculatorSchema = yup.object().shape({
  loanTypeId: yup.string().required('Loan type is required'),
  amount: yup
    .number()
    .required('Loan amount is required')
    .positive('Amount must be positive'),
  tenure: yup
    .number()
    .required('Tenure is required')
    .positive('Tenure must be positive')
    .integer('Tenure must be a whole number'),
  interestRate: yup
    .number()
    .required('Interest rate is required')
    .positive('Interest rate must be positive'),
  interestType: yup
    .string()
    .oneOf(['FLAT', 'DIMINISHING'], 'Invalid interest type')
    .required('Interest type is required'),
  startDate: yup.string().required('Start date is required'),
});

// Service to fetch loan types
const fetchLoanTypes = async (): Promise<LoanType[]> => {
  // This would be replaced with an actual API call
  // return apiService.get<LoanType[]>('/loan/types');
  
  // Mock data for now
  return [
    {
      id: '1',
      name: 'Personal Loan',
      code: 'PL',
      interestType: 'FLAT',
      minAmount: 1000,
      maxAmount: 50000,
      minTenure: 3,
      maxTenure: 36,
      interestRate: 12,
    },
    {
      id: '2',
      name: 'Business Loan',
      code: 'BL',
      interestType: 'DIMINISHING',
      minAmount: 5000,
      maxAmount: 200000,
      minTenure: 6,
      maxTenure: 60,
      interestRate: 15,
    },
    {
      id: '3',
      name: 'Education Loan',
      code: 'EL',
      interestType: 'DIMINISHING',
      minAmount: 10000,
      maxAmount: 100000,
      minTenure: 12,
      maxTenure: 84,
      interestRate: 10,
    },
  ];
};

// Service to calculate EMI
const calculateEMI = async (data: CalculatorFormData): Promise<EMICalculationResult> => {
  // This would be replaced with an actual API call
  // return apiService.post<EMICalculationResult>('/loan/calculator/emi', data);
  
  // Mock calculation for now
  const { amount, tenure, interestRate, interestType } = data;
  let emi = 0;
  let totalInterest = 0;
  
  if (interestType === 'FLAT') {
    // Flat interest calculation
    const monthlyInterestRate = interestRate / 100 / 12;
    totalInterest = amount * (interestRate / 100) * (tenure / 12);
    emi = (amount + totalInterest) / tenure;
  } else {
    // Diminishing interest calculation
    const monthlyInterestRate = interestRate / 100 / 12;
    emi = (amount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, tenure)) / 
          (Math.pow(1 + monthlyInterestRate, tenure) - 1);
    totalInterest = emi * tenure - amount;
  }
  
  return {
    emi,
    totalInterest,
    totalAmount: amount + totalInterest,
  };
};

// Service to generate amortization schedule
const generateSchedule = async (data: CalculatorFormData): Promise<InstallmentSchedule[]> => {
  // This would be replaced with an actual API call
  // return apiService.post<InstallmentSchedule[]>('/loan/calculator/schedule', data);
  
  // Mock schedule generation for now
  const { amount, tenure, interestRate, interestType, startDate } = data;
  const schedule: InstallmentSchedule[] = [];
  
  const startDateObj = new Date(startDate);
  let remainingPrincipal = amount;
  
  if (interestType === 'FLAT') {
    // Flat interest calculation
    const monthlyInterestRate = interestRate / 100 / 12;
    const totalInterest = amount * (interestRate / 100) * (tenure / 12);
    const emi = (amount + totalInterest) / tenure;
    const principalPerMonth = amount / tenure;
    const interestPerMonth = totalInterest / tenure;
    
    for (let i = 1; i <= tenure; i++) {
      const dueDate = new Date(startDateObj);
      dueDate.setMonth(startDateObj.getMonth() + i);
      
      remainingPrincipal -= principalPerMonth;
      
      schedule.push({
        installmentNumber: i,
        dueDate: dueDate.toISOString().split('T')[0],
        principal: principalPerMonth,
        interest: interestPerMonth,
        amount: emi,
        balance: remainingPrincipal,
      });
    }
  } else {
    // Diminishing interest calculation
    const monthlyInterestRate = interestRate / 100 / 12;
    const emi = (amount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, tenure)) / 
                (Math.pow(1 + monthlyInterestRate, tenure) - 1);
    
    for (let i = 1; i <= tenure; i++) {
      const dueDate = new Date(startDateObj);
      dueDate.setMonth(startDateObj.getMonth() + i);
      
      const interestForMonth = remainingPrincipal * monthlyInterestRate;
      const principalForMonth = emi - interestForMonth;
      
      remainingPrincipal -= principalForMonth;
      
      schedule.push({
        installmentNumber: i,
        dueDate: dueDate.toISOString().split('T')[0],
        principal: principalForMonth,
        interest: interestForMonth,
        amount: emi,
        balance: remainingPrincipal > 0 ? remainingPrincipal : 0,
      });
    }
  }
  
  return schedule;
};

const LoanCalculator: React.FC = () => {
  const [calculationResult, setCalculationResult] = useState<EMICalculationResult | null>(null);
  const [schedule, setSchedule] = useState<InstallmentSchedule[] | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedLoanType, setSelectedLoanType] = useState<LoanType | null>(null);

  // Fetch loan types
  const { data: loanTypes, isLoading: isLoadingLoanTypes } = useQuery(
    'loanTypes',
    fetchLoanTypes,
    {
      staleTime: 60 * 60 * 1000, // 1 hour
    }
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CalculatorFormData>({
    resolver: yupResolver(calculatorSchema),
    defaultValues: {
      loanTypeId: '',
      amount: 10000,
      tenure: 12,
      interestRate: 12,
      interestType: 'FLAT',
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  const watchLoanTypeId = watch('loanTypeId');

  // Update form values when loan type changes
  useEffect(() => {
    if (loanTypes && watchLoanTypeId) {
      const loanType = loanTypes.find(lt => lt.id === watchLoanTypeId);
      if (loanType) {
        setSelectedLoanType(loanType);
        setValue('interestRate', loanType.interestRate);
        setValue('interestType', loanType.interestType);
        
        // Ensure amount is within range
        const currentAmount = watch('amount');
        if (currentAmount < loanType.minAmount) {
          setValue('amount', loanType.minAmount);
        } else if (currentAmount > loanType.maxAmount) {
          setValue('amount', loanType.maxAmount);
        }
        
        // Ensure tenure is within range
        const currentTenure = watch('tenure');
        if (currentTenure < loanType.minTenure) {
          setValue('tenure', loanType.minTenure);
        } else if (currentTenure > loanType.maxTenure) {
          setValue('tenure', loanType.maxTenure);
        }
      }
    }
  }, [loanTypes, watchLoanTypeId, setValue, watch]);

  const onSubmit = async (data: CalculatorFormData) => {
    setIsCalculating(true);
    try {
      const result = await calculateEMI(data);
      setCalculationResult(result);
      
      const scheduleResult = await generateSchedule(data);
      setSchedule(scheduleResult);
    } catch (error) {
      console.error('Calculation failed:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Loan Calculator">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="loanTypeId" className="form-label">
                Loan Type
              </label>
              <select
                id="loanTypeId"
                className="form-input"
                {...register('loanTypeId')}
                disabled={isLoadingLoanTypes}
              >
                <option value="">Select Loan Type</option>
                {loanTypes?.map(loanType => (
                  <option key={loanType.id} value={loanType.id}>
                    {loanType.name}
                  </option>
                ))}
              </select>
              {errors.loanTypeId && (
                <p className="form-error">{errors.loanTypeId.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="amount" className="form-label">
                Loan Amount
              </label>
              <input
                id="amount"
                type="number"
                className="form-input"
                {...register('amount')}
                min={selectedLoanType?.minAmount || 1000}
                max={selectedLoanType?.maxAmount || 50000}
              />
              {errors.amount && (
                <p className="form-error">{errors.amount.message}</p>
              )}
              {selectedLoanType && (
                <p className="mt-1 text-xs text-gray-500">
                  Min: ${selectedLoanType.minAmount.toLocaleString()} | Max: ${selectedLoanType.maxAmount.toLocaleString()}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="tenure" className="form-label">
                Tenure (months)
              </label>
              <input
                id="tenure"
                type="number"
                className="form-input"
                {...register('tenure')}
                min={selectedLoanType?.minTenure || 3}
                max={selectedLoanType?.maxTenure || 36}
              />
              {errors.tenure && (
                <p className="form-error">{errors.tenure.message}</p>
              )}
              {selectedLoanType && (
                <p className="mt-1 text-xs text-gray-500">
                  Min: {selectedLoanType.minTenure} months | Max: {selectedLoanType.maxTenure} months
                </p>
              )}
            </div>

            <div>
              <label htmlFor="interestRate" className="form-label">
                Interest Rate (% per annum)
              </label>
              <input
                id="interestRate"
                type="number"
                step="0.01"
                className="form-input"
                {...register('interestRate')}
                readOnly={!!selectedLoanType}
              />
              {errors.interestRate && (
                <p className="form-error">{errors.interestRate.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="interestType" className="form-label">
                Interest Type
              </label>
              <select
                id="interestType"
                className="form-input"
                {...register('interestType')}
                disabled={!!selectedLoanType}
              >
                <option value="FLAT">Flat</option>
                <option value="DIMINISHING">Diminishing</option>
              </select>
              {errors.interestType && (
                <p className="form-error">{errors.interestType.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="startDate" className="form-label">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                className="form-input"
                {...register('startDate')}
              />
              {errors.startDate && (
                <p className="form-error">{errors.startDate.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              isLoading={isCalculating}
              disabled={isLoadingLoanTypes}
            >
              Calculate
            </Button>
          </div>
        </form>
      </Card>

      {calculationResult && (
        <Card title="Calculation Results">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <h3 className="text-lg font-medium text-gray-900">Monthly EMI</h3>
              <p className="mt-2 text-3xl font-bold text-primary-600">
                ${calculationResult.emi.toFixed(2)}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <h3 className="text-lg font-medium text-gray-900">Total Interest</h3>
              <p className="mt-2 text-3xl font-bold text-primary-600">
                ${calculationResult.totalInterest.toFixed(2)}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <h3 className="text-lg font-medium text-gray-900">Total Amount</h3>
              <p className="mt-2 text-3xl font-bold text-primary-600">
                ${calculationResult.totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {schedule && (
        <Card title="Amortization Schedule">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    #
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Due Date
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Principal
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Interest
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    EMI
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {schedule.map((installment) => (
                  <tr key={installment.installmentNumber}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {installment.installmentNumber}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(installment.dueDate).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      ${installment.principal.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      ${installment.interest.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      ${installment.amount.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      ${installment.balance.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default LoanCalculator;