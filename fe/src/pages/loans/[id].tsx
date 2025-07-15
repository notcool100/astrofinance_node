import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import loanService, { Loan, LoanSchedule } from '@/services/loanService';
import { ArrowLeftIcon, DocumentTextIcon, CurrencyDollarIcon, CalculatorIcon } from '@heroicons/react/24/outline';

const LoanStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'ACTIVE':
      return <Badge variant="primary">Active</Badge>;
    case 'CLOSED':
      return <Badge variant="success">Closed</Badge>;
    case 'DEFAULTED':
      return <Badge variant="danger">Defaulted</Badge>;
    case 'WRITTEN_OFF':
      return <Badge variant="warning">Written Off</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const InstallmentStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'PAID':
      return <Badge variant="success">Paid</Badge>;
    case 'PENDING':
      return <Badge variant="primary">Pending</Badge>;
    case 'OVERDUE':
      return <Badge variant="danger">Overdue</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const LoanDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [showSettlement, setShowSettlement] = useState(false);
  const [settlementDate, setSettlementDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [settlementLoading, setSettlementLoading] = useState(false);

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

  // Fetch settlement calculation
  const { data: settlement, isLoading: isLoadingSettlement } = useQuery(
    ['loanSettlement', id, settlementDate],
    () => loanService.calculateSettlement(id as string, { settlementDate }),
    {
      enabled: !!id && showSettlement,
    }
  );

  const handleSettleLoan = async () => {
    if (!settlement || !id) return;
    
    setSettlementLoading(true);
    try {
      await loanService.settleLoan(id as string, {
        settlementDate,
        amount: settlement.totalSettlementAmount,
        paymentMethod: 'BANK_TRANSFER',
      });
      
      // Redirect to payment confirmation page or refresh data
      router.push(`/loans/${id}/payments`);
    } catch (error) {
      console.error('Settlement failed:', error);
    } finally {
      setSettlementLoading(false);
    }
  };

  if (isLoadingLoan) {
    return (
      <ProtectedRoute>
        <MainLayout title="Loan Details">
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
        <MainLayout title="Loan Details">
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

  return (
    <ProtectedRoute>
      <MainLayout title={`Loan ${loan.loanNumber}`}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/loans')}
                icon={<ArrowLeftIcon className="h-5 w-5" />}
              >
                Back
              </Button>
              <h1 className="ml-4 text-2xl font-semibold text-gray-900">
                Loan {loan.loanNumber}
              </h1>
              <div className="ml-4">
                <LoanStatusBadge status={loan.status} />
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/loans/${id}/payments`)}
                icon={<CurrencyDollarIcon className="h-5 w-5 mr-2" />}
              >
                Make Payment
              </Button>
              {loan.status === 'ACTIVE' && (
                <Button
                  variant="primary"
                  onClick={() => setShowSettlement(!showSettlement)}
                  icon={<CalculatorIcon className="h-5 w-5 mr-2" />}
                >
                  Calculate Settlement
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card title="Loan Details">
              <div className="px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Loan Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">{loan.loanType?.name || 'N/A'}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Loan Amount</dt>
                    <dd className="mt-1 text-sm text-gray-900">${loan.amount.toLocaleString()}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Interest Rate</dt>
                    <dd className="mt-1 text-sm text-gray-900">{loan.interestRate}% ({loan.interestType})</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Tenure</dt>
                    <dd className="mt-1 text-sm text-gray-900">{loan.tenure} months</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">EMI</dt>
                    <dd className="mt-1 text-sm text-gray-900">${loan.emi.toLocaleString()}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Disbursement Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(loan.disbursementDate).toLocaleDateString()}
                    </dd>
                  </div>
                  {loan.status === 'CLOSED' && loan.closureDate && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Closure Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(loan.closureDate).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </Card>

            <Card title="Payment Summary" className="lg:col-span-2">
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <dt className="text-sm font-medium text-gray-500">Total Loan Amount</dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">
                      ${loan.amount.toLocaleString()}
                    </dd>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <dt className="text-sm font-medium text-gray-500">Total Paid</dt>
                    <dd className="mt-1 text-2xl font-semibold text-success-600">
                      ${(loan.emi * (schedule?.filter(s => s.status === 'PAID').length || 0)).toLocaleString()}
                    </dd>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <dt className="text-sm font-medium text-gray-500">Outstanding Balance</dt>
                    <dd className="mt-1 text-2xl font-semibold text-primary-600">
                      ${(schedule?.find(s => s.status === 'PENDING')?.balance || 0).toLocaleString()}
                    </dd>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {showSettlement && (
            <Card title="Early Settlement Calculator">
              <div className="px-4 py-5 sm:p-6">
                <div className="mb-4">
                  <label htmlFor="settlementDate" className="form-label">
                    Settlement Date
                  </label>
                  <input
                    id="settlementDate"
                    type="date"
                    className="form-input mt-1 w-full sm:w-64"
                    value={settlementDate}
                    onChange={(e) => setSettlementDate(e.target.value)}
                  />
                </div>

                {isLoadingSettlement ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                  </div>
                ) : settlement ? (
                  <div>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <dt className="text-sm font-medium text-gray-500">Outstanding Principal</dt>
                        <dd className="mt-1 text-lg font-semibold text-gray-900">
                          ${settlement.outstandingPrincipal.toLocaleString()}
                        </dd>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <dt className="text-sm font-medium text-gray-500">Interest Due</dt>
                        <dd className="mt-1 text-lg font-semibold text-gray-900">
                          ${settlement.interestDue.toLocaleString()}
                        </dd>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <dt className="text-sm font-medium text-gray-500">Fees & Charges</dt>
                        <dd className="mt-1 text-lg font-semibold text-gray-900">
                          ${(settlement.fees + settlement.penalties).toLocaleString()}
                        </dd>
                      </div>
                      <div className="bg-primary-50 p-4 rounded-lg">
                        <dt className="text-sm font-medium text-primary-700">Total Settlement Amount</dt>
                        <dd className="mt-1 text-lg font-semibold text-primary-700">
                          ${settlement.totalSettlementAmount.toLocaleString()}
                        </dd>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        variant="primary"
                        onClick={handleSettleLoan}
                        isLoading={settlementLoading}
                      >
                        Proceed to Settlement
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Select a settlement date to calculate the early settlement amount.
                  </p>
                )}
              </div>
            </Card>
          )}

          <Card title="Repayment Schedule">
            <div className="px-4 py-5 sm:p-6">
              {isLoadingSchedule ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              ) : schedule && schedule.length > 0 ? (
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
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {schedule.map((installment) => (
                        <tr key={installment.installmentNumber} className={installment.status === 'OVERDUE' ? 'bg-danger-50' : ''}>
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
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <InstallmentStatusBadge status={installment.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No repayment schedule available.
                </p>
              )}
            </div>
          </Card>

          <Card title="Loan Documents">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  View and download your loan documents
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<DocumentTextIcon className="h-5 w-5 mr-2" />}
                  onClick={() => router.push(`/loans/${id}/documents`)}
                >
                  View All Documents
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default LoanDetailPage;