import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'react-query';
import { useForm, FormProvider, useFormContext, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '@/components/common/Button';
import loanService, { LoanType as LoanTypeInterface, EMICalculationResult } from '@/services/loanService';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRightIcon, ArrowLeftIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// Dynamic schema based on loan type
const createLoanApplicationSchema = (selectedLoanType: LoanTypeInterface | null) => {
  const baseSchema = yup.object().shape({
    // Step 1: Loan Details
    loanTypeId: yup.string().required('Loan type is required'),
    amount: yup
      .number()
      .required('Loan amount is required')
      .positive('Amount must be positive')
      .min(selectedLoanType?.minAmount || 1000, `Minimum amount is ${selectedLoanType?.minAmount?.toLocaleString() || 1000}`)
      .max(selectedLoanType?.maxAmount || 50000, `Maximum amount is ${selectedLoanType?.maxAmount?.toLocaleString() || 50000}`),
    tenure: yup
      .number()
      .required('Tenure is required')
      .positive('Tenure must be positive')
      .integer('Tenure must be a whole number')
      .min(selectedLoanType?.minTenure || 3, `Minimum tenure is ${selectedLoanType?.minTenure || 3} months`)
      .max(selectedLoanType?.maxTenure || 36, `Maximum tenure is ${selectedLoanType?.maxTenure || 36} months`),
    purpose: yup.string().required('Loan purpose is required').min(10, 'Purpose must be at least 10 characters'),

    // Step 2: Financial Information
    employmentType: yup
      .string()
      .oneOf(['SALARIED', 'SELF_EMPLOYED', 'BUSINESS', 'OTHER'], 'Invalid employment type')
      .required('Employment type is required'),
    monthlyIncome: yup
      .number()
      .required('Monthly income is required')
      .positive('Monthly income must be positive')
      .min(1000, 'Monthly income must be at least 1000'),
    existingEmi: yup
      .number()
      .required('Existing EMI is required')
      .min(0, 'Existing EMI cannot be negative'),
    creditScore: yup
      .number()
      .nullable()
      .transform((value) => (isNaN(value) ? null : value))
      .min(300, 'Credit score must be at least 300')
      .max(900, 'Credit score must be at most 900'),
    bankName: yup.string().required('Bank name is required'),
    accountNumber: yup
      .string()
      .required('Account number is required')
      .matches(/^\d{9,18}$/, 'Account number must be 9-18 digits'),
    ifscCode: yup
      .string()
      .required('IFSC code is required')
      .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format'),

    // Step 3: Additional Information
    residenceType: yup
      .string()
      .oneOf(['OWNED', 'RENTED', 'FAMILY_OWNED', 'COMPANY_PROVIDED', 'OTHER'], 'Invalid residence type')
      .required('Residence type is required'),
    yearsAtCurrentAddress: yup
      .number()
      .required('Years at current address is required')
      .min(0, 'Years cannot be negative')
      .max(50, 'Years cannot exceed 50'),
    maritalStatus: yup
      .string()
      .oneOf(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'], 'Invalid marital status')
      .required('Marital status is required'),
    dependents: yup
      .number()
      .required('Number of dependents is required')
      .min(0, 'Dependents cannot be negative')
      .max(10, 'Dependents cannot exceed 10')
      .integer('Dependents must be a whole number'),
    emergencyContactName: yup.string().required('Emergency contact name is required'),
    emergencyContactPhone: yup
      .string()
      .required('Emergency contact phone is required')
      .matches(/^\d{10}$/, 'Phone number must be 10 digits'),
    emergencyContactRelation: yup.string().required('Relationship is required'),
  });

  return baseSchema;
};

// Form data interface
interface ExtendedLoanApplicationFormData {
  // Step 1: Loan Details
  loanTypeId: string;
  amount: number;
  tenure: number;
  purpose: string;
  
  // Step 2: Financial Information
  employmentType: 'SALARIED' | 'SELF_EMPLOYED' | 'BUSINESS' | 'OTHER';
  monthlyIncome: number;
  existingEmi: number;
  creditScore?: number | null;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  
  // Step 3: Additional Information
  residenceType: 'OWNED' | 'RENTED' | 'FAMILY_OWNED' | 'COMPANY_PROVIDED' | 'OTHER';
  yearsAtCurrentAddress: number;
  maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  dependents: number;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
}

// Step 1: Loan Details Component
const LoanDetailsStep: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const { formState: { errors }, register, watch, setValue, trigger } = useFormContext<ExtendedLoanApplicationFormData>();
  const [selectedLoanType, setSelectedLoanType] = useState<LoanTypeInterface | null>(null);
  const [emiCalculation, setEmiCalculation] = useState<EMICalculationResult | null>(null);
  const [isCalculatingEmi, setIsCalculatingEmi] = useState(false);
  
  const watchLoanTypeId = watch('loanTypeId');
  const watchAmount = watch('amount');
  const watchTenure = watch('tenure');

  // Fetch loan types
  const { data: loanTypesData, isLoading: isLoadingLoanTypes, error: loanTypesError } = useQuery(
    'loanTypes',
    () => loanService.getLoanTypes({ active: true }),
    {
      staleTime: 60 * 60 * 1000, // 1 hour
      retry: 3,
    }
  );
  
  const loanTypes = loanTypesData?.data || [];

  // Calculate EMI when loan type, amount, or tenure changes
  useEffect(() => {
    const calculateEMI = async () => {
      if (selectedLoanType && watchAmount && watchTenure) {
        setIsCalculatingEmi(true);
        try {
          const result = await loanService.calculateEMI({
            amount: watchAmount,
            tenure: watchTenure,
            interestRate: selectedLoanType.interestRate,
            interestType: selectedLoanType.interestType,
          });
          setEmiCalculation(result);
        } catch (error) {
          console.error('EMI calculation failed:', error);
          setEmiCalculation(null);
        } finally {
          setIsCalculatingEmi(false);
        }
      } else {
        setEmiCalculation(null);
      }
    };

    const debounceTimer = setTimeout(calculateEMI, 500);
    return () => clearTimeout(debounceTimer);
  }, [selectedLoanType, watchAmount, watchTenure]);

  // Update form values when loan type changes
  useEffect(() => {
    if (watchLoanTypeId && loanTypes.length > 0) {
      const loanType = loanTypes.find(lt => lt.id === watchLoanTypeId);
      
      if (loanType) {
        setSelectedLoanType(loanType);
        
        // Set default amount and tenure if they're not already set or are out of range
        if (!watchAmount || watchAmount < loanType.minAmount || watchAmount > loanType.maxAmount) {
          setValue('amount', loanType.minAmount);
        }
        
        if (!watchTenure || watchTenure < loanType.minTenure || watchTenure > loanType.maxTenure) {
          setValue('tenure', loanType.minTenure);
        }
      }
    }
  }, [loanTypes, watchLoanTypeId, setValue, watchAmount, watchTenure]);

  const handleNext = async () => {
    const isValid = await trigger(['loanTypeId', 'amount', 'tenure', 'purpose']);
    if (isValid) {
      onNext();
    }
  };

  if (loanTypesError) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Failed to load loan types</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please refresh the page to try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium leading-6 text-gray-900">Loan Details</h3>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="loanTypeId" className="form-label">
            Loan Type <span className="text-red-500">*</span>
          </label>
          <select
            id="loanTypeId"
            className={`form-input ${errors.loanTypeId ? 'border-red-300' : ''}`}
            {...register('loanTypeId')}
            disabled={isLoadingLoanTypes}
          >
            <option value="">Select Loan Type</option>
            {loanTypes.map(loanType => (
              <option key={loanType.id} value={loanType.id}>
                {loanType.name} ({loanType.interestRate}% - {loanType.interestType === 'FLAT' ? 'Flat' : 'Reducing'})
              </option>
            ))}
          </select>
          {errors.loanTypeId && (
            <p className="form-error">{errors.loanTypeId.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="amount" className="form-label">
            Loan Amount <span className="text-red-500">*</span>
          </label>
          <input
            id="amount"
            type="number"
            className={`form-input ${errors.amount ? 'border-red-300' : ''}`}
            {...register('amount')}
            min={selectedLoanType?.minAmount || 1000}
            max={selectedLoanType?.maxAmount || 50000}
            step="100"
          />
          {errors.amount && (
            <p className="form-error">{errors.amount.message}</p>
          )}
          {selectedLoanType && (
            <p className="mt-1 text-xs text-gray-500">
              Min: ₹{selectedLoanType.minAmount.toLocaleString()} | Max: ₹{selectedLoanType.maxAmount.toLocaleString()}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="tenure" className="form-label">
            Tenure (months) <span className="text-red-500">*</span>
          </label>
          <input
            id="tenure"
            type="number"
            className={`form-input ${errors.tenure ? 'border-red-300' : ''}`}
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
            Loan Purpose <span className="text-red-500">*</span>
          </label>
          <input
            id="purpose"
            type="text"
            className={`form-input ${errors.purpose ? 'border-red-300' : ''}`}
            placeholder="e.g., Home renovation, Education, Business expansion"
            {...register('purpose')}
          />
          {errors.purpose && (
            <p className="form-error">{errors.purpose.message}</p>
          )}
        </div>
      </div>

      {selectedLoanType && watchAmount && watchTenure && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">Loan Summary</h4>
          {isCalculatingEmi ? (
            <div className="mt-2 text-sm text-gray-500">Calculating EMI...</div>
          ) : emiCalculation ? (
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Monthly EMI</p>
                <p className="text-sm font-medium text-gray-900">₹{emiCalculation.emi.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Interest Rate</p>
                <p className="text-sm font-medium text-gray-900">{selectedLoanType.interestRate}% per annum</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Amount Payable</p>
                <p className="text-sm font-medium text-gray-900">₹{emiCalculation.totalAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Interest</p>
                <p className="text-sm font-medium text-gray-900">₹{emiCalculation.totalInterest.toFixed(2)}</p>
              </div>
            </div>
          ) : (
            <div className="mt-2 text-sm text-gray-500">Unable to calculate EMI</div>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="button"
          variant="primary"
          onClick={handleNext}
          icon={<ArrowRightIcon className="h-5 w-5 ml-1" />}
          iconPosition="right"
          disabled={isLoadingLoanTypes}
        >
          Next: Financial Information
        </Button>
      </div>
    </div>
  );
};

// Step 2: Financial Information Component
const FinancialInfoStep: React.FC<{ onNext: () => void; onPrevious: () => void }> = ({ onNext, onPrevious }) => {
  const { formState: { errors }, register, trigger } = useFormContext<ExtendedLoanApplicationFormData>();

  const handleNext = async () => {
    const isValid = await trigger([
      'employmentType', 'monthlyIncome', 'existingEmi', 'creditScore', 
      'bankName', 'accountNumber', 'ifscCode'
    ]);
    if (isValid) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium leading-6 text-gray-900">Financial Information</h3>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="employmentType" className="form-label">
            Employment Type <span className="text-red-500">*</span>
          </label>
          <select
            id="employmentType"
            className={`form-input ${errors.employmentType ? 'border-red-300' : ''}`}
            {...register('employmentType')}
          >
            <option value="">Select Employment Type</option>
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
            Monthly Income <span className="text-red-500">*</span>
          </label>
          <input
            id="monthlyIncome"
            type="number"
            className={`form-input ${errors.monthlyIncome ? 'border-red-300' : ''}`}
            placeholder="e.g., 50000"
            {...register('monthlyIncome')}
            min="1000"
            step="1000"
          />
          {errors.monthlyIncome && (
            <p className="form-error">{errors.monthlyIncome.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="existingEmi" className="form-label">
            Existing EMI (if any) <span className="text-red-500">*</span>
          </label>
          <input
            id="existingEmi"
            type="number"
            className={`form-input ${errors.existingEmi ? 'border-red-300' : ''}`}
            placeholder="e.g., 0"
            {...register('existingEmi')}
            min="0"
            step="100"
          />
          {errors.existingEmi && (
            <p className="form-error">{errors.existingEmi.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="creditScore" className="form-label">
            Credit Score (if known)
          </label>
          <input
            id="creditScore"
            type="number"
            className={`form-input ${errors.creditScore ? 'border-red-300' : ''}`}
            placeholder="e.g., 750"
            {...register('creditScore')}
            min="300"
            max="900"
          />
          {errors.creditScore && (
            <p className="form-error">{errors.creditScore.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Bank Account Details</h4>
        </div>

        <div>
          <label htmlFor="bankName" className="form-label">
            Bank Name <span className="text-red-500">*</span>
          </label>
          <input
            id="bankName"
            type="text"
            className={`form-input ${errors.bankName ? 'border-red-300' : ''}`}
            placeholder="e.g., HDFC Bank"
            {...register('bankName')}
          />
          {errors.bankName && (
            <p className="form-error">{errors.bankName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="accountNumber" className="form-label">
            Account Number <span className="text-red-500">*</span>
          </label>
          <input
            id="accountNumber"
            type="text"
            className={`form-input ${errors.accountNumber ? 'border-red-300' : ''}`}
            placeholder="e.g., 123456789"
            {...register('accountNumber')}
          />
          {errors.accountNumber && (
            <p className="form-error">{errors.accountNumber.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="ifscCode" className="form-label">
            IFSC Code <span className="text-red-500">*</span>
          </label>
          <input
            id="ifscCode"
            type="text"
            className={`form-input ${errors.ifscCode ? 'border-red-300' : ''}`}
            placeholder="e.g., HDFC0001234"
            {...register('ifscCode')}
          />
          {errors.ifscCode && (
            <p className="form-error">{errors.ifscCode.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={onPrevious}
          icon={<ArrowLeftIcon className="h-5 w-5 mr-1" />}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleNext}
          icon={<ArrowRightIcon className="h-5 w-5 ml-1" />}
          iconPosition="right"
        >
          Next: Additional Information
        </Button>
      </div>
    </div>
  );
};

// Step 3: Additional Information Component
const AdditionalInfoStep: React.FC<{ onPrevious: () => void }> = ({ onPrevious }) => {
  const { formState: { errors }, register, trigger } = useFormContext<ExtendedLoanApplicationFormData>();

  const handleSubmit = async () => {
    const isValid = await trigger([
      'residenceType', 'yearsAtCurrentAddress', 'maritalStatus', 'dependents',
      'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelation'
    ]);
    if (isValid) {
      // Form will be submitted by the parent component
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium leading-6 text-gray-900">Additional Information</h3>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="residenceType" className="form-label">
            Residence Type <span className="text-red-500">*</span>
          </label>
          <select
            id="residenceType"
            className={`form-input ${errors.residenceType ? 'border-red-300' : ''}`}
            {...register('residenceType')}
          >
            <option value="">Select Residence Type</option>
            <option value="OWNED">Owned</option>
            <option value="RENTED">Rented</option>
            <option value="FAMILY_OWNED">Family Owned</option>
            <option value="COMPANY_PROVIDED">Company Provided</option>
            <option value="OTHER">Other</option>
          </select>
          {errors.residenceType && (
            <p className="form-error">{errors.residenceType.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="yearsAtCurrentAddress" className="form-label">
            Years at Current Address <span className="text-red-500">*</span>
          </label>
          <input
            id="yearsAtCurrentAddress"
            type="number"
            className={`form-input ${errors.yearsAtCurrentAddress ? 'border-red-300' : ''}`}
            placeholder="e.g., 3"
            {...register('yearsAtCurrentAddress')}
            min="0"
            max="50"
            step="0.5"
          />
          {errors.yearsAtCurrentAddress && (
            <p className="form-error">{errors.yearsAtCurrentAddress.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="maritalStatus" className="form-label">
            Marital Status <span className="text-red-500">*</span>
          </label>
          <select
            id="maritalStatus"
            className={`form-input ${errors.maritalStatus ? 'border-red-300' : ''}`}
            {...register('maritalStatus')}
          >
            <option value="">Select Marital Status</option>
            <option value="SINGLE">Single</option>
            <option value="MARRIED">Married</option>
            <option value="DIVORCED">Divorced</option>
            <option value="WIDOWED">Widowed</option>
          </select>
          {errors.maritalStatus && (
            <p className="form-error">{errors.maritalStatus.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="dependents" className="form-label">
            Number of Dependents <span className="text-red-500">*</span>
          </label>
          <input
            id="dependents"
            type="number"
            className={`form-input ${errors.dependents ? 'border-red-300' : ''}`}
            placeholder="e.g., 2"
            {...register('dependents')}
            min="0"
            max="10"
          />
          {errors.dependents && (
            <p className="form-error">{errors.dependents.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Emergency Contact</h4>
        </div>

        <div>
          <label htmlFor="emergencyContactName" className="form-label">
            Contact Name <span className="text-red-500">*</span>
          </label>
          <input
            id="emergencyContactName"
            type="text"
            className={`form-input ${errors.emergencyContactName ? 'border-red-300' : ''}`}
            placeholder="e.g., John Doe"
            {...register('emergencyContactName')}
          />
          {errors.emergencyContactName && (
            <p className="form-error">{errors.emergencyContactName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="emergencyContactPhone" className="form-label">
            Contact Phone <span className="text-red-500">*</span>
          </label>
          <input
            id="emergencyContactPhone"
            type="text"
            className={`form-input ${errors.emergencyContactPhone ? 'border-red-300' : ''}`}
            placeholder="e.g., 9876543210"
            {...register('emergencyContactPhone')}
          />
          {errors.emergencyContactPhone && (
            <p className="form-error">{errors.emergencyContactPhone.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="emergencyContactRelation" className="form-label">
            Relationship <span className="text-red-500">*</span>
          </label>
          <input
            id="emergencyContactRelation"
            type="text"
            className={`form-input ${errors.emergencyContactRelation ? 'border-red-300' : ''}`}
            placeholder="e.g., Spouse, Parent, Sibling"
            {...register('emergencyContactRelation')}
          />
          {errors.emergencyContactRelation && (
            <p className="form-error">{errors.emergencyContactRelation.message}</p>
          )}
        </div>
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
              Terms and Conditions <span className="text-red-500">*</span>
            </label>
            <p className="text-gray-500">
              I agree to the terms and conditions and authorize AstroFinance to check my credit history.
              I confirm that all information provided is accurate and complete.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={onPrevious}
          icon={<ArrowLeftIcon className="h-5 w-5 mr-1" />}
        >
          Previous
        </Button>
        <Button
          type="submit"
          variant="primary"
          icon={<CheckCircleIcon className="h-5 w-5 ml-1" />}
          iconPosition="right"
          onClick={handleSubmit}
        >
          Submit Application
        </Button>
      </div>
    </div>
  );
};

// Success Component
const SuccessStep: React.FC<{ applicationId: string }> = ({ applicationId }) => {
  return (
    <div className="text-center py-8">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
        <CheckCircleIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
      </div>
      <h3 className="mt-3 text-lg font-medium text-gray-900">Application Submitted Successfully</h3>
      <div className="mt-2">
        <p className="text-sm text-gray-500">
          Your loan application has been submitted successfully. Your application ID is:
        </p>
        <p className="mt-2 text-lg font-bold text-primary-600">{applicationId}</p>
        <p className="mt-4 text-sm text-gray-500">
          You will be redirected to the application status page shortly. You can track the status of your application there.
        </p>
      </div>
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-2 bg-white text-sm text-gray-500">What's Next?</span>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h4 className="text-sm font-medium text-gray-900">1. Application Review</h4>
              <p className="mt-2 text-xs text-gray-500">
                Our team will review your application within 1-2 business days.
              </p>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h4 className="text-sm font-medium text-gray-900">2. Document Verification</h4>
              <p className="mt-2 text-xs text-gray-500">
                If approved, you'll need to upload required documents for verification.
              </p>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h4 className="text-sm font-medium text-gray-900">3. Loan Disbursement</h4>
              <p className="mt-2 text-xs text-gray-500">
                Once verified, the loan amount will be disbursed to your account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Form Component
const LoanApplicationForm: React.FC<{ onSuccess?: (applicationId: string) => void }> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedLoanType, setSelectedLoanType] = useState<LoanTypeInterface | null>(null);

  // Create loan application mutation
  const createApplicationMutation = useMutation(
    (data: ExtendedLoanApplicationFormData) => {
      const serviceData = {
        loanTypeId: data.loanTypeId,
        amount: data.amount,
        tenure: data.tenure,
        purpose: data.purpose,
      };
      return loanService.createLoanApplication(serviceData);
    },
    {
      onSuccess: (result) => {
        setApplicationId(result.id);
        setCurrentStep(4);
        if (onSuccess) {
          onSuccess(result.id);
        }
      },
      onError: (error: any) => {
        setErrorMessage(error?.message || 'Failed to submit loan application');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    }
  );

  // Create dynamic schema based on selected loan type
  const dynamicSchema = createLoanApplicationSchema(selectedLoanType);

  const methods = useForm<ExtendedLoanApplicationFormData>({
    resolver: yupResolver(dynamicSchema),
    defaultValues: {
      // Step 1: Loan Details
      loanTypeId: '',
      amount: 0,
      tenure: 0,
      purpose: '',
      
      // Step 2: Financial Information
      employmentType: 'SALARIED',
      monthlyIncome: 0,
      existingEmi: 0,
      creditScore: null,
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      
      // Step 3: Additional Information
      residenceType: 'RENTED',
      yearsAtCurrentAddress: 0,
      maritalStatus: 'SINGLE',
      dependents: 0,
      emergencyContactName: user?.fullName || '',
      emergencyContactPhone: user?.contactNumber || '',
      emergencyContactRelation: '',
    },
    mode: 'onChange',
  });

  // Update schema when loan type changes
  useEffect(() => {
    const subscription = methods.watch((value, { name }) => {
      if (name === 'loanTypeId' && value.loanTypeId) {
        // This will trigger a re-render with the new schema
        setSelectedLoanType(null); // Will be set in the step component
      }
    });
    return () => subscription.unsubscribe();
  }, [methods]);

  const onSubmit: SubmitHandler<ExtendedLoanApplicationFormData> = async (data) => {
    if (!user?.id) {
      setErrorMessage('User not authenticated');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      await createApplicationMutation.mutateAsync(data);
    } catch (error) {
      // Error is handled by the mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const renderStepIndicator = () => {
    return (
      <div className="mb-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-between">
            <div className="flex items-center">
              <span className={`h-10 w-10 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? 'bg-primary-600' : 'bg-gray-200'
              }`}>
                <span className={`text-sm font-medium ${
                  currentStep >= 1 ? 'text-white' : 'text-gray-500'
                }`}>1</span>
              </span>
              <span className="ml-3 text-sm font-medium text-gray-900">Loan Details</span>
            </div>
            <div className="flex items-center">
              <span className={`h-10 w-10 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-200'
              }`}>
                <span className={`text-sm font-medium ${
                  currentStep >= 2 ? 'text-white' : 'text-gray-500'
                }`}>2</span>
              </span>
              <span className="ml-3 text-sm font-medium text-gray-900">Financial Info</span>
            </div>
            <div className="flex items-center">
              <span className={`h-10 w-10 rounded-full flex items-center justify-center ${
                currentStep >= 3 ? 'bg-primary-600' : 'bg-gray-200'
              }`}>
                <span className={`text-sm font-medium ${
                  currentStep >= 3 ? 'text-white' : 'text-gray-500'
                }`}>3</span>
              </span>
              <span className="ml-3 text-sm font-medium text-gray-900">Additional Info</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Authentication Required</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please log in to apply for a loan.
        </p>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        {errorMessage && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{errorMessage}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep < 4 && renderStepIndicator()}

        {currentStep === 1 && <LoanDetailsStep onNext={nextStep} />}
        {currentStep === 2 && <FinancialInfoStep onNext={nextStep} onPrevious={prevStep} />}
        {currentStep === 3 && <AdditionalInfoStep onPrevious={prevStep} />}
        {currentStep === 4 && applicationId && <SuccessStep applicationId={applicationId} />}
      </form>
    </FormProvider>
  );
};

export default LoanApplicationForm;