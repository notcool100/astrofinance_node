import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '@/components/common/Button';

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

interface LoanApplicationFormData {
  loanTypeId: string;
  amount: number;
  tenure: number;
  purpose: string;
  employmentType: 'SALARIED' | 'SELF_EMPLOYED' | 'BUSINESS' | 'OTHER';
  monthlyIncome: number;
  existingEmi: number;
}

const loanApplicationSchema = yup.object().shape({
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
  purpose: yup.string().required('Loan purpose is required'),
  employmentType: yup
    .string()
    .oneOf(['SALARIED', 'SELF_EMPLOYED', 'BUSINESS', 'OTHER'], 'Invalid employment type')
    .required('Employment type is required'),
  monthlyIncome: yup
    .number()
    .required('Monthly income is required')
    .positive('Monthly income must be positive'),
  existingEmi: yup
    .number()
    .required('Existing EMI is required')
    .min(0, 'Existing EMI cannot be negative'),
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

// Service to submit loan application
const submitLoanApplication = async (_data: LoanApplicationFormData): Promise<{ id: string; status: string }> => {
  // This would be replaced with an actual API call
  // return apiService.post<{ id: string; status: string }>('/loan/applications', data);
  
  // Mock response for now
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        id: 'LA-' + Math.floor(Math.random() * 10000),
        status: 'PENDING',
      });
    }, 1000);
  });
};

const LoanApplicationForm: React.FC<{ onSuccess?: (_applicationId: string) => void }> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
  } = useForm<LoanApplicationFormData>({
    resolver: yupResolver(loanApplicationSchema),
    defaultValues: {
      loanTypeId: '',
      amount: 0,
      tenure: 0,
      purpose: '',
      employmentType: 'SALARIED',
      monthlyIncome: 0,
      existingEmi: 0,
    },
  });

  const watchLoanTypeId = watch('loanTypeId');

  // Update form values when loan type changes
  useEffect(() => {
    if (loanTypes && watchLoanTypeId) {
      const loanType = loanTypes.find(lt => lt.id === watchLoanTypeId);
      if (loanType) {
        setSelectedLoanType(loanType);
        
        // Set default amount and tenure
        setValue('amount', loanType.minAmount);
        setValue('tenure', loanType.minTenure);
      }
    }
  }, [loanTypes, watchLoanTypeId, setValue]);

  const onSubmit = async (data: LoanApplicationFormData) => {
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      const result = await submitLoanApplication(data);
      setSuccessMessage(`Loan application submitted successfully. Application ID: ${result.id}`);
      
      if (onSuccess) {
        onSuccess(result.id);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit loan application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {successMessage && (
        <div className="rounded-md bg-success-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-success-800">Success</h3>
              <div className="mt-2 text-sm text-success-700">
                <p>{successMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-md bg-danger-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-danger-800">Error</h3>
              <div className="mt-2 text-sm text-danger-700">
                <p>{errorMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}

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
          <label htmlFor="purpose" className="form-label">
            Loan Purpose
          </label>
          <input
            id="purpose"
            type="text"
            className="form-input"
            {...register('purpose')}
          />
          {errors.purpose && (
            <p className="form-error">{errors.purpose.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="employmentType" className="form-label">
            Employment Type
          </label>
          <select
            id="employmentType"
            className="form-input"
            {...register('employmentType')}
          >
            <option value="SALARIED">Salaried</option>
            <option value="SELF_EMPLOYED">Self Employed</option>
            <option value="BUSINESS">Business</option>
            <option value="OTHER">Other</option>
          </select>
          {errors.employmentType && (
            <p className="form-error">{errors.employmentType.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="monthlyIncome" className="form-label">
            Monthly Income
          </label>
          <input
            id="monthlyIncome"
            type="number"
            className="form-input"
            {...register('monthlyIncome')}
          />
          {errors.monthlyIncome && (
            <p className="form-error">{errors.monthlyIncome.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="existingEmi" className="form-label">
            Existing EMI (if any)
          </label>
          <input
            id="existingEmi"
            type="number"
            className="form-input"
            {...register('existingEmi')}
          />
          {errors.existingEmi && (
            <p className="form-error">{errors.existingEmi.message}</p>
          )}
        </div>
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Required Documents</h3>
        <p className="mt-1 text-sm text-gray-500">
          You&apos;ll need to upload the following documents after submitting your application:
        </p>
        <ul className="mt-3 list-disc list-inside text-sm text-gray-500">
          <li>Identity Proof (Aadhar Card, PAN Card, Passport, etc.)</li>
          <li>Address Proof (Utility Bill, Rental Agreement, etc.)</li>
          <li>Income Proof (Salary Slips, Bank Statements, etc.)</li>
          <li>Photograph</li>
        </ul>
      </div>

      <div className="pt-4">
        <div className="relative flex items-start">
          <div className="flex h-5 items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              required
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="font-medium text-gray-700">
              Terms and Conditions
            </label>
            <p className="text-gray-500">
              I agree to the terms and conditions and authorize AstroFinance to check my credit history.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          disabled={isLoadingLoanTypes}
        >
          Submit Application
        </Button>
      </div>
    </form>
  );
};

export default LoanApplicationForm;