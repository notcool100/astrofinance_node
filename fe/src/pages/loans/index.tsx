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
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';

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

  const columns = React.useMemo(
    () => [
      {
        Header: 'Loan Number',
        accessor: 'loanNumber',
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
        Cell: ({ value }: { value: string }) => new Date(value).toLocaleDateString(),
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }: { value: string }) => <LoanStatusBadge status={value} />,
      },
      {
        Header: 'Actions',
        accessor: 'id',
        Cell: ({ value }: { value: string }) => (
          <div className="flex space-x-2">
            <button
              onClick={() => router.push(`/loans/${value}`)}
              className="text-primary-600 hover:text-primary-900"
            >
              View
            </button>
            <button
              onClick={() => router.push(`/loans/${value}/payments`)}
              className="text-primary-600 hover:text-primary-900"
            >
              Payments
            </button>
          </div>
        ),
      },
    ],
    [router]
  );

  const handleRowClick = (row: any) => {
    router.push(`/loans/${row.original.id}`);
  };

  return (
    <ProtectedRoute>
      <MainLayout title="My Loans">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">My Loans</h1>
              <p className="mt-1 text-sm text-gray-500">
                View and manage all your loans
              </p>
            </div>
            <Button
              variant="primary"
              icon={<PlusIcon className="h-5 w-5 mr-2" />}
              onClick={() => router.push('/loans/apply')}
            >
              Apply for Loan
            </Button>
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
                    <option value="WRITTEN_OFF">Written Off</option>
                  </select>
                </div>
              </div>

              <Table
                columns={columns}
                data={loansData?.data || []}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                emptyMessage="You don't have any loans yet. Apply for a loan to get started."
              />
            </div>
          </Card>

          <Card title="Loan Applications">
            <div className="px-4 py-5 sm:p-6">
              <p className="text-sm text-gray-500 mb-4">
                Check the status of your loan applications
              </p>
              <Button
                variant="outline"
                onClick={() => router.push('/loans/applications')}
              >
                View Applications
              </Button>
            </div>
          </Card>

          <Card title="Need Help?">
            <div className="px-4 py-5 sm:p-6">
              <p className="text-sm text-gray-500 mb-4">
                If you have any questions about your loans or need assistance, our support team is here to help.
              </p>
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/help')}
                >
                  View Help Center
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/contact')}
                >
                  Contact Support
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default LoansPage;