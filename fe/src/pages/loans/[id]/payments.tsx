import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import loanService, { Loan, LoanPayment, LoanPaymentFormData } from '@/services/loanService';
import { ArrowLeftIcon, CreditCardIcon } from '@heroicons/react/24/outline';

const paymentSchema = yup.object().shape({
  amount: yup
    .number()
    .required('Amount is required')
    .positive('Amount must be positive'),
  paymentDate: yup.string().required('Payment date is required'),
  paymentMethod: yup
    .string()
    .oneOf(['CASH', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE'], 'Invalid payment method')
    .required('Payment method is required'),
  reference: yup.string(),
});

const PaymentStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'COMPLETED':
      return <Badge variant="success">Completed</Badge>;
    case 'PENDING':
      return <Badge variant="primary">Pending</Badge>;
    case 'FAILED':
      return <Badge variant="danger">Failed</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const LoanPaymentsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch loan details
  const { data: loan, isLoading: isLoadingLoan } = useQuery(
    ['loan', id],
    () => loanService.getLoanById(id as string),
    {
      enabled: !!id,
    }
  );

  // Fetch loan schedule
  const { data: schedule, isLoading: isLoadingSchedule } = useQuery(
    ['loanSchedule', id],
    () => loanService.getLoanSchedule(id as string),
    {
      enabled: !!id,
    }
  );

  // Mock payment history data (would be fetched from API)
  const paymentHistory: LoanPayment[] = [
    {
      id: '1',
      loanId: id as string,
      amount: 500,
      paymentDate: '2023-11-15',
      paymentMethod: 'BANK_TRANSFER',
      reference: 'TXN123456',
      status: 'COMPLETED',
    },
    {
      id: '2',
      loanId: id as string,
      amount: 500,
      paymentDate: '2023-10-15',
      paymentMethod: 'ONLINE',
      reference: 'TXN123123',
      status: 'COMPLETED',
    },
  ];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoanPaymentFormData>({
    resolver: yupResolver(paymentSchema),
    defaultValues: {
      amount: loan?.emi || 0,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'BANK_TRANSFER',
      reference: '',
    },
  });

  const onSubmit = async (data: LoanPaymentFormData) => {
    if (!id) return;
    
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      await loanService.recordLoanPayment(id as string, data);
      setSuccessMessage('Payment recorded successfully');
      reset(); // Clear form
      
      // Refresh data
      // refetch();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingLoan) {
    return (
      <ProtectedRoute>
        <MainLayout title="Loan Payments">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  if (!loan) {
    return (
      <ProtectedRoute>
        <MainLayout title="Loan Payments">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">Loan not found</h3>
            <p className="mt-2 text-sm text-gray-500">
              The loan you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <div className="mt-6">
              <Button
                variant="primary"
                onClick={() => router.push('/loans')}
                icon={<ArrowLeftIcon className="h-5 w-5 mr-2" />}
              >
                Back to Loans
              </Button>
            </div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  // Find next payment due
  const nextPayment = schedule?.find(s => s.status === 'PENDING');

  return (
    <ProtectedRoute>
      <MainLayout title={`Payments - Loan ${loan.loanNumber}`}>
        <div className="space-y-6">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/loans/${id}`)}
              icon={<ArrowLeftIcon className="h-5 w-5" />}
            >
              Back to Loan
            </Button>
            <h1 className="ml-4 text-2xl font-semibold text-gray-900">
              Payments for Loan {loan.loanNumber}
            </h1>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card title="Make a Payment">
              <div className="px-4 py-5 sm:p-6">
                {loan.status !== 'ACTIVE' ? (
                  <div className="text-center py-6">
                    <h3 className="text-lg font-medium text-gray-900">Payments not available</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      This loan is {loan.status.toLowerCase()}, so no payments can be made.
                    </p>
                  </div>
                ) : (
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

                    <div>
                      <label htmlFor="amount" className="form-label">
                        Payment Amount
                      </label>
                      <div className="mt-1">
                        <input
                          id="amount"
                          type="number"
                          step="0.01"
                          className="form-input"
                          {...register('amount')}
                        />
                        {errors.amount && (
                          <p className="form-error">{errors.amount.message}</p>
                        )}
                      </div>
                      {nextPayment && (
                        <p className="mt-1 text-xs text-gray-500">
                          Next installment amount: ${nextPayment.amount.toFixed(2)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="paymentDate" className="form-label">
                        Payment Date
                      </label>
                      <div className="mt-1">
                        <input
                          id="paymentDate"
                          type="date"
                          className="form-input"
                          {...register('paymentDate')}
                        />
                        {errors.paymentDate && (
                          <p className="form-error">{errors.paymentDate.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="paymentMethod" className="form-label">
                        Payment Method
                      </label>
                      <div className="mt-1">
                        <select
                          id="paymentMethod"
                          className="form-input"
                          {...register('paymentMethod')}
                        >
                          <option value="BANK_TRANSFER">Bank Transfer</option>
                          <option value="ONLINE">Online Payment</option>
                          <option value="CASH">Cash</option>
                          <option value="CHEQUE">Cheque</option>
                        </select>
                        {errors.paymentMethod && (
                          <p className="form-error">{errors.paymentMethod.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="reference" className="form-label">
                        Reference Number (Optional)
                      </label>
                      <div className="mt-1">
                        <input
                          id="reference"
                          type="text"
                          className="form-input"
                          {...register('reference')}
                        />
                        {errors.reference && (
                          <p className="form-error">{errors.reference.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        isLoading={isSubmitting}
                        icon={<CreditCardIcon className="h-5 w-5 mr-2" />}
                      >
                        Make Payment
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </Card>

            <Card title="Payment Summary">
              <div className="px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Loan Number</dt>
                    <dd className="mt-1 text-sm text-gray-900">{loan.loanNumber}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Loan Amount</dt>
                    <dd className="mt-1 text-sm text-gray-900">${loan.amount.toLocaleString()}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Monthly EMI</dt>
                    <dd className="mt-1 text-sm text-gray-900">${loan.emi.toLocaleString()}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Total Paid</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      ${(loan.emi * (schedule?.filter(s => s.status === 'PAID').length || 0)).toLocaleString()}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Outstanding Balance</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      ${(nextPayment?.balance || 0).toLocaleString()}
                    </dd>
                  </div>
                </dl>

                {nextPayment && (
                  <div className="mt-6 p-4 bg-primary-50 rounded-md">
                    <h4 className="text-sm font-medium text-primary-800">Next Payment Due</h4>
                    <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-xs text-primary-700">Due Date</dt>
                        <dd className="mt-1 text-sm font-medium text-primary-900">
                          {new Date(nextPayment.dueDate).toLocaleDateString()}
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-xs text-primary-700">Amount</dt>
                        <dd className="mt-1 text-sm font-medium text-primary-900">
                          ${nextPayment.amount.toFixed(2)}
                        </dd>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <Card title="Payment History">
            <div className="px-4 py-5 sm:p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Payment Date
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Amount
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Payment Method
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Reference
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {paymentHistory.length > 0 ? (
                      paymentHistory.map((payment) => (
                        <tr key={payment.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            ${payment.amount.toFixed(2)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {payment.paymentMethod.replace('_', ' ')}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {payment.reference || '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <PaymentStatusBadge status={payment.status} />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-sm text-gray-500">
                          No payment history found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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

export default LoanPaymentsPage;
