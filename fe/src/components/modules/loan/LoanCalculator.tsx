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
  principal: number;
  interestRate: number;
  tenure: number;
  interestType: string;
  emi: number;
  totalInterest: number;
  totalAmount: number;
}

interface InstallmentSchedule {
  installmentNumber: number;
  dueDate: string;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  remainingPrincipal: number;
}

interface ScheduleResponse {
  summary: EMICalculationResult;
  schedule: InstallmentSchedule[];
}

interface CompareResult {
  flat: {
    emi: number;
    totalInterest: number;
    totalAmount: number;
  };
  diminishing: {
    emi: number;
    totalInterest: number;
    totalAmount: number;
  };
  savings: number;
}

const calculatorSchema = yup.object().shape({
  loanTypeId: yup.string(),
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

// Service to fetch loan types from API
const fetchLoanTypes = async (): Promise<LoanType[]> => {
  try {
    const response = await apiService.get<{ data: LoanType[] }>('/loan/types');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching loan types:', error);
    return [];
  }
};

// Service to calculate EMI using backend API
const calculateEMI = async (data: CalculatorFormData): Promise<EMICalculationResult> => {
  const response = await apiService.post<EMICalculationResult>('/loan/calculator/emi', {
    principal: data.amount,
    interestRate: data.interestRate,
    tenure: data.tenure,
    interestType: data.interestType,
  });
  return response;
};

// Service to generate amortization schedule using backend API
const generateSchedule = async (data: CalculatorFormData): Promise<ScheduleResponse> => {
  const response = await apiService.post<ScheduleResponse>('/loan/calculator/schedule', {
    principal: data.amount,
    interestRate: data.interestRate,
    tenure: data.tenure,
    interestType: data.interestType,
    disbursementDate: data.startDate,
  });
  return response;
};

// Service to compare interest methods
const compareInterestMethods = async (data: CalculatorFormData): Promise<CompareResult> => {
  const response = await apiService.post<CompareResult>('/loan/calculator/compare', {
    principal: data.amount,
    interestRate: data.interestRate,
    tenure: data.tenure,
  });
  return response;
};

const LoanCalculator: React.FC = () => {
  const [calculationResult, setCalculationResult] = useState<EMICalculationResult | null>(null);
  const [schedule, setSchedule] = useState<InstallmentSchedule[] | null>(null);
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedLoanType, setSelectedLoanType] = useState<LoanType | null>(null);
  const [activeTab, setActiveTab] = useState<'calculator' | 'compare'>('calculator');

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
      amount: 100000,
      tenure: 12,
      interestRate: 12,
      interestType: 'DIMINISHING',
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  const watchLoanTypeId = watch('loanTypeId');
  const watchAmount = watch('amount');
  const watchTenure = watch('tenure');
  const watchInterestRate = watch('interestRate');

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
      setSchedule(scheduleResult.schedule);
    } catch (error) {
      console.error('Calculation failed:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const onCompare = async () => {
    const data = {
      loanTypeId: '',
      amount: watchAmount,
      tenure: watchTenure,
      interestRate: watchInterestRate,
      interestType: 'FLAT' as const,
      startDate: new Date().toISOString().split('T')[0],
    };

    setIsCalculating(true);
    try {
      const result = await compareInterestMethods(data);
      setCompareResult(result);
    } catch (error) {
      console.error('Comparison failed:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 2,
    }).format(amount).replace('NPR', 'Rs');
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'calculator'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            EMI Calculator
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'compare'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Compare Interest Types
          </button>
        </nav>
      </div>

      <Card title={activeTab === 'calculator' ? 'EMI Calculator' : 'Compare Interest Methods'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="loanTypeId" className="form-label">
                Loan Type (Optional)
              </label>
              <select
                id="loanTypeId"
                className="form-input"
                {...register('loanTypeId')}
                disabled={isLoadingLoanTypes}
              >
                <option value="">Custom Calculation</option>
                {loanTypes?.map(loanType => (
                  <option key={loanType.id} value={loanType.id}>
                    {loanType.name} ({loanType.interestRate}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="amount" className="form-label">
                Loan Amount (Rs)
              </label>
              <input
                id="amount"
                type="number"
                className="form-input"
                {...register('amount')}
                min={selectedLoanType?.minAmount || 1000}
                max={selectedLoanType?.maxAmount || 10000000}
              />
              {errors.amount && (
                <p className="form-error">{errors.amount.message}</p>
              )}
              {selectedLoanType && (
                <p className="mt-1 text-xs text-gray-500">
                  Range: Rs {selectedLoanType.minAmount.toLocaleString()} - Rs {selectedLoanType.maxAmount.toLocaleString()}
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
                min={selectedLoanType?.minTenure || 1}
                max={selectedLoanType?.maxTenure || 360}
              />
              {errors.tenure && (
                <p className="form-error">{errors.tenure.message}</p>
              )}
              {selectedLoanType && (
                <p className="mt-1 text-xs text-gray-500">
                  Range: {selectedLoanType.minTenure} - {selectedLoanType.maxTenure} months
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
              >
                <option value="FLAT">Flat Rate</option>
                <option value="DIMINISHING">Diminishing Balance</option>
              </select>
              {errors.interestType && (
                <p className="form-error">{errors.interestType.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="startDate" className="form-label">
                Disbursement Date
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

          <div className="flex justify-end gap-4">
            {activeTab === 'compare' && (
              <Button
                type="button"
                variant="secondary"
                onClick={onCompare}
                isLoading={isCalculating}
              >
                Compare Methods
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              isLoading={isCalculating}
            >
              Calculate EMI
            </Button>
          </div>
        </form>
      </Card>

      {/* Calculation Results */}
      {calculationResult && activeTab === 'calculator' && (
        <Card title="Calculation Results">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl text-center shadow-sm">
              <h3 className="text-sm font-medium text-blue-800 uppercase tracking-wide">Monthly EMI</h3>
              <p className="mt-3 text-3xl font-bold text-blue-900">
                {formatCurrency(calculationResult.emi)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl text-center shadow-sm">
              <h3 className="text-sm font-medium text-green-800 uppercase tracking-wide">Principal</h3>
              <p className="mt-3 text-3xl font-bold text-green-900">
                {formatCurrency(calculationResult.principal)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl text-center shadow-sm">
              <h3 className="text-sm font-medium text-amber-800 uppercase tracking-wide">Total Interest</h3>
              <p className="mt-3 text-3xl font-bold text-amber-900">
                {formatCurrency(calculationResult.totalInterest)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl text-center shadow-sm">
              <h3 className="text-sm font-medium text-purple-800 uppercase tracking-wide">Total Payable</h3>
              <p className="mt-3 text-3xl font-bold text-purple-900">
                {formatCurrency(calculationResult.totalAmount)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Compare Results */}
      {compareResult && activeTab === 'compare' && (
        <Card title="Comparison Results">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Flat Rate</h3>
              <div className="space-y-2">
                <p className="flex justify-between">
                  <span className="text-blue-700">Monthly EMI:</span>
                  <span className="font-semibold">{formatCurrency(compareResult.flat.emi)}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-blue-700">Total Interest:</span>
                  <span className="font-semibold">{formatCurrency(compareResult.flat.totalInterest)}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-blue-700">Total Amount:</span>
                  <span className="font-semibold">{formatCurrency(compareResult.flat.totalAmount)}</span>
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-green-900 mb-4">Diminishing Balance</h3>
              <div className="space-y-2">
                <p className="flex justify-between">
                  <span className="text-green-700">Monthly EMI:</span>
                  <span className="font-semibold">{formatCurrency(compareResult.diminishing.emi)}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-green-700">Total Interest:</span>
                  <span className="font-semibold">{formatCurrency(compareResult.diminishing.totalInterest)}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-green-700">Total Amount:</span>
                  <span className="font-semibold">{formatCurrency(compareResult.diminishing.totalAmount)}</span>
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl shadow-sm flex flex-col justify-center">
              <h3 className="text-lg font-semibold text-amber-900 mb-2 text-center">Your Savings</h3>
              <p className="text-4xl font-bold text-amber-900 text-center">
                {formatCurrency(compareResult.savings)}
              </p>
              <p className="text-sm text-amber-700 text-center mt-2">
                with Diminishing Balance
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Amortization Schedule */}
      {schedule && schedule.length > 0 && activeTab === 'calculator' && (
        <Card title="Amortization Schedule">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                    #
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Due Date
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                    Principal
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                    Interest
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                    EMI
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {schedule.map((installment) => (
                  <tr key={installment.installmentNumber} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                      {installment.installmentNumber}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(installment.dueDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 text-right">
                      {formatCurrency(installment.principalAmount)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                      {formatCurrency(installment.interestAmount)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(installment.totalAmount)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                      {formatCurrency(installment.remainingPrincipal)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={2} className="py-3.5 pl-4 pr-3 text-sm font-semibold text-gray-900">
                    Total
                  </td>
                  <td className="px-3 py-3.5 text-sm font-semibold text-gray-900 text-right">
                    {formatCurrency(schedule.reduce((sum, i) => sum + i.principalAmount, 0))}
                  </td>
                  <td className="px-3 py-3.5 text-sm font-semibold text-gray-900 text-right">
                    {formatCurrency(schedule.reduce((sum, i) => sum + i.interestAmount, 0))}
                  </td>
                  <td className="px-3 py-3.5 text-sm font-semibold text-gray-900 text-right">
                    {formatCurrency(schedule.reduce((sum, i) => sum + i.totalAmount, 0))}
                  </td>
                  <td className="px-3 py-3.5 text-sm text-gray-500 text-right">-</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default LoanCalculator;