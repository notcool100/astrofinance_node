import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from 'react-query';
import { toast } from 'react-hot-toast';

import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import loanService, { LoanType } from '@/services/loanService';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface FormData {
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

const NewLoanTypePage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    code: '',
    interestType: 'DIMINISHING',
    minAmount: 1000,
    maxAmount: 50000,
    minTenure: 3,
    maxTenure: 12,
    interestRate: 0,
    processingFeePercent: 0,
    lateFeeAmount: 0,
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useMutation(
    (data: FormData) => loanService.createLoanType(data),
    {
      onSuccess: () => {
        toast.success('Loan type created successfully');
        router.push('/loans/types');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to create loan type');
      },
    }
  );

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    } else if (!/^[A-Z0-9]+$/.test(formData.code)) {
      newErrors.code = 'Code must contain only uppercase letters and numbers';
    }

    if (formData.minAmount <= 0) {
      newErrors.minAmount = 'Minimum amount must be positive';
    } else if (formData.minAmount < 1000) {
      newErrors.minAmount = 'Minimum loan amount should be at least 1000';
    }

    if (formData.maxAmount <= 0) {
      newErrors.maxAmount = 'Maximum amount must be positive';
    } else if (formData.maxAmount <= formData.minAmount) {
      newErrors.maxAmount = 'Maximum amount must be greater than minimum amount';
    }

    if (formData.minTenure <= 0) {
      newErrors.minTenure = 'Minimum tenure must be positive';
    } else if (formData.minTenure < 3) {
      newErrors.minTenure = 'Minimum tenure should be at least 3 months';
    }

    if (formData.maxTenure <= 0) {
      newErrors.maxTenure = 'Maximum tenure must be positive';
    } else if (formData.maxTenure <= formData.minTenure) {
      newErrors.maxTenure = 'Maximum tenure must be greater than minimum tenure';
    }

    if (formData.interestRate <= 0) {
      newErrors.interestRate = 'Interest rate must be positive';
    } else if (formData.interestRate > 50) {
      newErrors.interestRate = 'Interest rate seems unusually high (>50%). Please verify.';
    }

    if (formData.processingFeePercent < 0 || formData.processingFeePercent > 100) {
      newErrors.processingFeePercent = 'Processing fee must be between 0 and 100%';
    }

    if (formData.lateFeeAmount < 0) {
      newErrors.lateFeeAmount = 'Late fee cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout title="Create New Loan Type">
        <div className="container mx-auto px-4">
          <div className="mt-4 mb-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              icon={<ArrowLeftIcon className="h-5 w-5 mr-2" />}
              className="mb-4"
            >
              Back to Loan Types
            </Button>

            <h1 className="text-2xl font-semibold mb-1">Create New Loan Type</h1>
            <p className="text-gray-600">Define a new loan product with its terms and conditions</p>
          </div>

          <Card>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                  </div>

                  <div>
                    <label className="form-label">Loan Type Code *</label>
                    <input
                      type="text"
                      className={`form-input ${errors.code ? 'border-red-500' : ''}`}
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                      placeholder="e.g., PL, HL, GOLD"
                    />
                    {errors.code && <p className="form-error">{errors.code}</p>}
                    <p className="mt-1 text-xs text-gray-500">Use uppercase letters and numbers only</p>
                  </div>

                  <div>
                    <label className="form-label">Loan Type Name *</label>
                    <input
                      type="text"
                      className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Personal Loan, Home Loan"
                    />
                    {errors.name && <p className="form-error">{errors.name}</p>}
                  </div>

                  {/* Interest Details */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 mt-6">Interest Details</h3>
                  </div>

                  <div>
                    <label className="form-label">Interest Type *</label>
                    <select
                      className="form-input"
                      value={formData.interestType}
                      onChange={(e) => handleInputChange('interestType', e.target.value as 'FLAT' | 'DIMINISHING')}
                    >
                      <option value="FLAT">Flat Rate</option>
                      <option value="DIMINISHING">Reducing Balance</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Interest Rate (% per annum) *</label>
                    <input
                      type="number"
                      step="0.01"
                      className={`form-input ${errors.interestRate ? 'border-red-500' : ''}`}
                      value={formData.interestRate}
                      onChange={(e) => handleInputChange('interestRate', parseFloat(e.target.value) || 0)}
                    />
                    {errors.interestRate && <p className="form-error">{errors.interestRate}</p>}
                  </div>

                  {/* Amount Range */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 mt-6">Amount Range</h3>
                  </div>

                  <div>
                    <label className="form-label">Minimum Loan Amount *</label>
                    <input
                      type="number"
                      className={`form-input ${errors.minAmount ? 'border-red-500' : ''}`}
                      value={formData.minAmount}
                      onChange={(e) => handleInputChange('minAmount', parseFloat(e.target.value) || 0)}
                    />
                    {errors.minAmount && <p className="form-error">{errors.minAmount}</p>}
                  </div>

                  <div>
                    <label className="form-label">Maximum Loan Amount *</label>
                    <input
                      type="number"
                      className={`form-input ${errors.maxAmount ? 'border-red-500' : ''}`}
                      value={formData.maxAmount}
                      onChange={(e) => handleInputChange('maxAmount', parseFloat(e.target.value) || 0)}
                    />
                    {errors.maxAmount && <p className="form-error">{errors.maxAmount}</p>}
                  </div>

                  {/* Tenure Range */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 mt-6">Tenure Range (in months)</h3>
                  </div>

                  <div>
                    <label className="form-label">Minimum Tenure (months) *</label>
                    <input
                      type="number"
                      className={`form-input ${errors.minTenure ? 'border-red-500' : ''}`}
                      value={formData.minTenure}
                      onChange={(e) => handleInputChange('minTenure', parseInt(e.target.value) || 0)}
                    />
                    {errors.minTenure && <p className="form-error">{errors.minTenure}</p>}
                  </div>

                  <div>
                    <label className="form-label">Maximum Tenure (months) *</label>
                    <input
                      type="number"
                      className={`form-input ${errors.maxTenure ? 'border-red-500' : ''}`}
                      value={formData.maxTenure}
                      onChange={(e) => handleInputChange('maxTenure', parseInt(e.target.value) || 0)}
                    />
                    {errors.maxTenure && <p className="form-error">{errors.maxTenure}</p>}
                  </div>

                  {/* Fees & Charges */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 mt-6">Fees & Charges</h3>
                  </div>

                  <div>
                    <label className="form-label">Processing Fee (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      className={`form-input ${errors.processingFeePercent ? 'border-red-500' : ''}`}
                      value={formData.processingFeePercent}
                      onChange={(e) => handleInputChange('processingFeePercent', parseFloat(e.target.value) || 0)}
                    />
                    {errors.processingFeePercent && <p className="form-error">{errors.processingFeePercent}</p>}
                  </div>

                  <div>
                    <label className="form-label">Late Payment Fee</label>
                    <input
                      type="number"
                      className={`form-input ${errors.lateFeeAmount ? 'border-red-500' : ''}`}
                      value={formData.lateFeeAmount}
                      onChange={(e) => handleInputChange('lateFeeAmount', parseFloat(e.target.value) || 0)}
                    />
                    {errors.lateFeeAmount && <p className="form-error">{errors.lateFeeAmount}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center mt-6">
                      <label htmlFor="isActive" className="mr-2 text-sm">
                        Active
                      </label>
                      <div className="relative inline-flex items-center mr-2">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={formData.isActive}
                          onChange={(e) => handleInputChange('isActive', e.target.checked)}
                          className="sr-only peer"
                        />

                        <label
                          htmlFor="isActive"
                          className="relative w-11 h-6 bg-gray-300 rounded-full cursor-pointer
               transition-colors peer-checked:bg-green-600"
                        ></label>

                        <span
                          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
               transform transition-transform duration-300
               peer-checked:translate-x-5 pointer-events-none"
                        ></span>
                      </div>

                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={createMutation.isLoading}
                  >
                    {createMutation.isLoading ? 'Creating...' : 'Create Loan Type'}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};



export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await import('next-i18next/serverSideTranslations').then(m => 
        m.serverSideTranslations(locale, ['common', 'user', 'auth'])
      )),
    },
  };
}

export default NewLoanTypePage;
