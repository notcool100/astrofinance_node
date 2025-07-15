import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useQuery, useMutation } from 'react-query';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import apiService from '@/services/api';

// Types
interface User {
  id: string;
  fullName: string;
  contactNumber: string;
  email?: string;
}

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
  processingFeePercent: number;
}

interface LoanApplicationFormData {
  userId: string;
  loanTypeId: string;
  amount: number;
  tenure: number;
  purpose: string;
}

// Validation schema
const loanApplicationSchema = yup.object().shape({
  userId: yup.string().required('User is required'),
  loanTypeId: yup.string().required('Loan type is required'),
  amount: yup
    .number()
    .required('Loan amount is required')
    .positive('Amount must be positive'),
  tenure: yup
    .number()
    .required('Loan tenure is required')
    .positive('Tenure must be positive')
    .integer('Tenure must be a whole number'),
  purpose: yup.string().required('Loan purpose is required'),
});

// Service to fetch users
const fetchUsers = async (): Promise<User[]> => {
  try {
    // This would be replaced with an actual API call
    // return apiService.get<User[]>('/staff/users/active');
    
    // Mock data for now
    return Array.from({ length: 10 }, (_, i) => ({
      id: `user-${i + 1}`,
      fullName: `User ${i + 1}`,
      contactNumber: `+977 98${Math.floor(10000000 + Math.random() * 90000000)}`,
      email: i % 2 === 0 ? `user${i + 1}@example.com` : undefined,
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Service to fetch loan types
const fetchLoanTypes = async (): Promise<LoanType[]> => {
  try {
    // This would be replaced with an actual API call
    // return apiService.get<LoanType[]>('/loan/types');
    
    // Mock data for now
    return [
      {
        id: 'loan-type-1',
        name: 'Personal Loan',
        code: 'PL',
        interestType: 'DIMINISHING',
        minAmount: 10000,
        maxAmount: 500000,
        minTenure: 3,
        maxTenure: 36,
        interestRate: 12,
        processingFeePercent: 1,
      },
      {
        id: 'loan-type-2',
        name: 'Business Loan',
        code: 'BL',
        interestType: 'FLAT',
        minAmount: 50000,
        maxAmount: 2000000,
        minTenure: 6,
        maxTenure: 60,
        interestRate: 14,
        processingFeePercent: 1.5,
      },
      {
        id: 'loan-type-3',
        name: 'Education Loan',
        code: 'EL',
        interestType: 'DIMINISHING',
        minAmount: 25000,
        maxAmount: 1000000,
        minTenure: 12,
        maxTenure: 84,
        interestRate: 10,
        processingFeePercent: 0.5,
      },
    ];
  } catch (error) {
    console.error('Error fetching loan types:', error);
    throw error;
  }
};

// Service to create loan application
const createLoanApplication = async (data: LoanApplicationFormData) => {
  try {
    // This would be replaced with an actual API call
    // return apiService.post('/loan/applications', data);
    
    // Mock response for now
    return {
      id: 'app-' + Math.random().toString(36).substr(2, 9),
      applicationNumber: 'LA-' + Date.now().toString().substr(-6),
      ...data,
      status: 'PENDING',
      appliedDate: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error creating loan application:', error);
    throw error;
  }
};

const NewLoanApplicationPage = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedLoanType, setSelectedLoanType] = useState<LoanType | null>(null);

  // Fetch users and loan types
  const { data: users, isLoading: isLoadingUsers } = useQuery('users', fetchUsers, {
    enabled: isAuthenticated,
  });

  const { data: loanTypes, isLoading: isLoadingLoanTypes } = useQuery('loanTypes', fetchLoanTypes, {
    enabled: isAuthenticated,
  });

  // Form setup
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoanApplicationFormData>({
    resolver: yupResolver(loanApplicationSchema),
    defaultValues: {
      userId: '',
      loanTypeId: '',
      amount: 0,
      tenure: 0,
      purpose: '',
    },
  });

  // Watch for loan type changes
  const watchLoanTypeId = watch('loanTypeId');
  React.useEffect(() => {
    if (watchLoanTypeId && loanTypes) {
      const loanType = loanTypes.find((lt) => lt.id === watchLoanTypeId);
      if (loanType) {
        setSelectedLoanType(loanType);
        // Reset amount and tenure if they're outside the new loan type's bounds
        setValue('amount', Math.max(loanType.minAmount, Math.min(loanType.maxAmount, watch('amount') || 0)));
        setValue('tenure', Math.max(loanType.minTenure, Math.min(loanType.maxTenure, watch('tenure') || 0)));
      }
    }
  }, [watchLoanTypeId, loanTypes, setValue, watch]);

  // Create loan application mutation
  const mutation = useMutation(createLoanApplication, {
    onSuccess: (data) => {
      alert(`Loan application created successfully! Application Number: ${data.applicationNumber}`);
      router.push('/staff/applications');
    },
  });

  const onSubmit = (data: LoanApplicationFormData) => {
    mutation.mutate(data);
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute staffOnly>
      <MainLayout title="New Loan Application">
        <div className="space-y-6">
          <Card>
            <div className="p-4">
              <h1 className="text-xl font-semibold text-gray-900">Create New Loan Application</h1>
              <p className="mt-1 text-sm text-gray-500">
                Fill out the form below to create a new loan application for a user.
              </p>
            </div>
          </Card>

          <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* User Selection */}
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                  Select User
                </label>
                <div className="mt-1">
                  <select
                    id="userId"
                    className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md ${
                      errors.userId ? 'border-red-300' : ''
                    }`}
                    {...register('userId')}
                  >
                    <option value="">Select a user</option>
                    {isLoadingUsers ? (
                      <option value="" disabled>
                        Loading users...
                      </option>
                    ) : (
                      users?.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.fullName} ({user.contactNumber})
                        </option>
                      ))
                    )}
                  </select>
                  {errors.userId && (
                    <p className="mt-2 text-sm text-red-600">{errors.userId.message}</p>
                  )}
                </div>
              </div>

              {/* Loan Type Selection */}
              <div>
                <label htmlFor="loanTypeId" className="block text-sm font-medium text-gray-700">
                  Loan Type
                </label>
                <div className="mt-1">
                  <select
                    id="loanTypeId"
                    className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md ${
                      errors.loanTypeId ? 'border-red-300' : ''
                    }`}
                    {...register('loanTypeId')}
                  >
                    <option value="">Select a loan type</option>
                    {isLoadingLoanTypes ? (
                      <option value="" disabled>
                        Loading loan types...
                      </option>
                    ) : (
                      loanTypes?.map((loanType) => (
                        <option key={loanType.id} value={loanType.id}>
                          {loanType.name} ({loanType.interestRate}% - {loanType.interestType})
                        </option>
                      ))
                    )}
                  </select>
                  {errors.loanTypeId && (
                    <p className="mt-2 text-sm text-red-600">{errors.loanTypeId.message}</p>
                  )}
                </div>
              </div>

              {/* Loan Details */}
              {selectedLoanType && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Loan Type Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Interest Rate:</span>{' '}
                      <span className="font-medium">{selectedLoanType.interestRate}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Interest Type:</span>{' '}
                      <span className="font-medium">{selectedLoanType.interestType}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Amount Range:</span>{' '}
                      <span className="font-medium">
                        ${selectedLoanType.minAmount.toLocaleString()} - $
                        {selectedLoanType.maxAmount.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Tenure Range:</span>{' '}
                      <span className="font-medium">
                        {selectedLoanType.minTenure} - {selectedLoanType.maxTenure} months
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Processing Fee:</span>{' '}
                      <span className="font-medium">{selectedLoanType.processingFeePercent}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Loan Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Loan Amount
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    className={`mt-1 block w-full pl-7 pr-12 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md ${
                      errors.amount ? 'border-red-300' : ''
                    }`}
                    placeholder="0.00"
                    {...register('amount')}
                    min={selectedLoanType?.minAmount || 0}
                    max={selectedLoanType?.maxAmount || 0}
                  />
                  {selectedLoanType && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">
                        / {selectedLoanType.maxAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
                {errors.amount && (
                  <p className="mt-2 text-sm text-red-600">{errors.amount.message}</p>
                )}
                {selectedLoanType && (
                  <p className="mt-2 text-xs text-gray-500">
                    Amount must be between ${selectedLoanType.minAmount.toLocaleString()} and $
                    {selectedLoanType.maxAmount.toLocaleString()}
                  </p>
                )}
              </div>

              {/* Loan Tenure */}
              <div>
                <label htmlFor="tenure" className="block text-sm font-medium text-gray-700">
                  Loan Tenure (months)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    id="tenure"
                    className={`mt-1 block w-full py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md ${
                      errors.tenure ? 'border-red-300' : ''
                    }`}
                    {...register('tenure')}
                    min={selectedLoanType?.minTenure || 0}
                    max={selectedLoanType?.maxTenure || 0}
                  />
                </div>
                {errors.tenure && (
                  <p className="mt-2 text-sm text-red-600">{errors.tenure.message}</p>
                )}
                {selectedLoanType && (
                  <p className="mt-2 text-xs text-gray-500">
                    Tenure must be between {selectedLoanType.minTenure} and {selectedLoanType.maxTenure}{' '}
                    months
                  </p>
                )}
              </div>

              {/* Loan Purpose */}
              <div>
                <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                  Loan Purpose
                </label>
                <div className="mt-1">
                  <textarea
                    id="purpose"
                    rows={3}
                    className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md ${
                      errors.purpose ? 'border-red-300' : ''
                    }`}
                    placeholder="Describe the purpose of this loan"
                    {...register('purpose')}
                  />
                  {errors.purpose && (
                    <p className="mt-2 text-sm text-red-600">{errors.purpose.message}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/staff/applications')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={mutation.isLoading}
                >
                  Create Application
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default NewLoanApplicationPage;