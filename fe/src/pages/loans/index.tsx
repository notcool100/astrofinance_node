import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Table from '@/components/common/Table';
import Badge from '@/components/common/Badge';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import loanService, { Loan } from '@/services/loanService';
import { Column } from 'react-table';
import { PlusIcon, FunnelIcon, CalculatorIcon } from '@heroicons/react/24/outline';

const LoanStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'ACTIVE':
      return <Badge variant="success">Active</Badge>;
    case 'CLOSED':
      return <Badge variant="secondary">Closed</Badge>;
    case 'DEFAULTED':
      return <Badge variant="danger">Defaulted</Badge>;
    case 'WRITTEN_OFF':
      return <Badge variant="warning">Written Off</Badge>;
    default:
      return <Badge variant="primary">{status}</Badge>;
  }
};

const LoansPage = () => {
  const router = useRouter();
  const [filter, setFilter] = useState({
    status: '',
    loanType: '',
  });

  // Fetch loans
  const { data: loansData, isLoading } = useQuery(
    ['loans', filter],
    () => loanService.getLoans(filter),
    {
      keepPreviousData: true,
    }
  );

  const columns: Column<Loan>[] = React.useMemo(
    () => [
      {
        Header: 'Loan Number',
        accessor: 'loanNumber',
      },
      {
        Header: 'Loan Type',
        accessor: 'loanType',
        Cell: ({ row }: any) => row.original.loanType?.name || 'N/A',
      },
      {
        Header: 'Amount',
        accessor: 'amount',
        Cell: ({ value }: { value: number }) => `$${value.toLocaleString()}`,
      },
      {
        Header: 'EMI',
        accessor: 'emi',
        Cell: ({ value }: { value: number }) => `$${value.toLocaleString()}`,
      },
      {
        Header: 'Tenure',
        accessor: 'tenure',
        Cell: ({ value }: { value: number }) => `${value} months`,
      },
      {
        Header: 'Disbursement Date',
        accessor: 'disbursementDate',
        Cell: ({ value }: { value: string }) => value ? new Date(value).toLocaleDateString() : 'N/A',
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }: { value: string }) => <LoanStatusBadge status={value} />,
      },
      {
        Header: 'Actions',
        accessor: 'id',
        Cell: ({ row }: any) => (
          <div className="flex space-x-2">
            <button
              onClick={() => router.push(`/loans/${row.original.id}`)}
              className="text-primary-600 hover:text-primary-900"
            >
              View
            </button>
            {row.original.status === 'ACTIVE' && (
              <button
                onClick={() => router.push(`/loans/${row.original.id}/payments`)}
                className="text-primary-600 hover:text-primary-900"
              >
                Pay
              </button>
            )}
          </div>
        ),
      },
    ],
    [router]
  );

  const handleRowClick = (row: any) => {
    router.push(`/loans/${row.original.id}`);
  };

  // Mock data for now
  const mockLoans: Loan[] = [
    {
      id: 'L-1001',
      loanNumber: 'LN-1001',
      userId: 'user-1',
      applicationId: 'LA-1001',
      amount: 10000,
      tenure: 12,
      interestRate: 12,
      interestType: 'FLAT',
      emi: 916.67,
      disbursementDate: '2023-12-05',
      status: 'ACTIVE',
      loanType: {
        id: '1',
        name: 'Personal Loan',
        code: 'PL',
        interestType: 'FLAT',
        minAmount: 1000,
        maxAmount: 50000,
        minTenure: 3,
        maxTenure: 36,
        interestRate: 12,
        isActive: true,
      },
    },
    {
      id: 'L-1002',
      loanNumber: 'LN-1002',
      userId: 'user-1',
      applicationId: 'LA-1002',
      amount: 25000,
      tenure: 24,
      interestRate: 15,
      interestType: 'DIMINISHING',
      emi: 1207.73,
      disbursementDate: '2023-11-15',
      status: 'ACTIVE',
      loanType: {
        id: '2',
        name: 'Business Loan',
        code: 'BL',
        interestType: 'DIMINISHING',
        minAmount: 5000,
        maxAmount: 200000,
        minTenure: 6,
        maxTenure: 60,
        interestRate: 15,
        isActive: true,
      },
    },
    {
      id: 'L-1003',
      loanNumber: 'LN-1003',
      userId: 'user-1',
      applicationId: 'LA-1003',
      amount: 5000,
      tenure: 6,
      interestRate: 10,
      interestType: 'FLAT',
      emi: 875.00,
      disbursementDate: '2023-09-20',
      status: 'CLOSED',
      closureDate: '2024-03-20',
      loanType: {
        id: '1',
        name: 'Personal Loan',
        code: 'PL',
        interestType: 'FLAT',
        minAmount: 1000,
        maxAmount: 50000,
        minTenure: 3,
        maxTenure: 36,
        interestRate: 12,
        isActive: true,
      },
    },
  ];

  return (
    <ProtectedRoute>
      <MainLayout title="My Loans">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">My Loans</h1>
              <p className="mt-1 text-sm text-gray-500">
                View and manage your active and past loans
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                icon={<CalculatorIcon className="h-5 w-5 mr-2" />}
                onClick={() => router.push('/loans/calculator')}
              >
                Loan Calculator
              </Button>
              <Button
                variant="primary"
                icon={<PlusIcon className="h-5 w-5 mr-2" />}
                onClick={() => router.push('/loans/apply')}
              >
                Apply for Loan
              </Button>
            </div>
          </div>

          <Card>
            <div className="px-4 py-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Loan List</h3>
                <div className="mt-3 sm:mt-0 flex items-center space-x-2">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                  <select
                    className="form-input py-1 pl-2 pr-8"
                    value={filter.status}
                    onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                  >
                    <option value="">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="CLOSED">Closed</option>
                    <option value="DEFAULTED">Defaulted</option>
                  </select>
                  <select
                    className="form-input py-1 pl-2 pr-8"
                    value={filter.loanType}
                    onChange={(e) => setFilter({ ...filter, loanType: e.target.value })}
                  >
                    <option value="">All Loan Types</option>
                    <option value="1">Personal Loan</option>
                    <option value="2">Business Loan</option>
                    <option value="3">Education Loan</option>
                  </select>
                </div>
              </div>

              <Table
                columns={columns}
                data={loansData?.data || mockLoans}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                emptyMessage="You don't have any loans yet. Apply for a loan to get started."
              />
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Active Loans</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>You have {mockLoans.filter(loan => loan.status === 'ACTIVE').length} active loans.</p>
                </div>
                <div className="mt-5">
                  <div className="rounded-md bg-gray-50 px-6 py-5 sm:flex sm:items-start sm:justify-between">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 sm:mt-0 sm:ml-4">
                        <div className="text-sm font-medium text-gray-900">Total Outstanding</div>
                        <div className="mt-1 text-sm text-gray-600 sm:flex sm:items-center">
                          <div>
                            ${mockLoans
                              .filter(loan => loan.status === 'ACTIVE')
                              .reduce((sum, loan) => sum + loan.amount, 0)
                              .toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-6 sm:flex-shrink-0">
                      <Button
                        variant="secondary"
                        onClick={() => router.push('/loans/applications')}
                      >
                        View Applications
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Monthly Payments</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>Your total monthly EMI payments across all active loans.</p>
                </div>
                <div className="mt-5">
                  <div className="rounded-md bg-gray-50 px-6 py-5 sm:flex sm:items-start sm:justify-between">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 sm:mt-0 sm:ml-4">
                        <div className="text-sm font-medium text-gray-900">Total Monthly EMI</div>
                        <div className="mt-1 text-sm text-gray-600 sm:flex sm:items-center">
                          <div>
                            ${mockLoans
                              .filter(loan => loan.status === 'ACTIVE')
                              .reduce((sum, loan) => sum + loan.emi, 0)
                              .toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-6 sm:flex-shrink-0">
                      <Button
                        variant="secondary"
                        onClick={() => router.push('/loans/payments')}
                      >
                        Payment History
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Need Help?</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>If you have any questions about your loans or need assistance, our support team is here to help.</p>
                </div>
                <div className="mt-5">
                  <div className="flex space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => router.push('/help')}
                    >
                      Help Center
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/contact')}
                    >
                      Contact Support
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default LoansPage;