import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Table from '@/components/common/Table';
import Badge from '@/components/common/Badge';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import loanService, { LoanApplication } from '@/services/loanService';
import { Column } from 'react-table';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';

const ApplicationStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'PENDING':
      return <Badge variant="primary">Pending</Badge>;
    case 'APPROVED':
      return <Badge variant="success">Approved</Badge>;
    case 'REJECTED':
      return <Badge variant="danger">Rejected</Badge>;
    case 'DISBURSED':
      return <Badge variant="info">Disbursed</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const LoanApplicationsPage = () => {
  const router = useRouter();
  const [filter, setFilter] = useState({
    status: '',
    loanType: '',
  });

  // Fetch loan applications
  const { data: applicationsData, isLoading } = useQuery(
    ['loanApplications', filter],
    () => loanService.getLoanApplications(filter),
    {
      keepPreviousData: true,
    }
  );

  const columns = React.useMemo(
    () => [
      {
        Header: 'Application ID',
        accessor: 'id' as keyof LoanApplication,
      },
      {
        Header: 'Loan Type',
        accessor: 'loanType' as keyof LoanApplication,
        Cell: ({ row }: any) => row.original.loanType?.name || 'N/A',
      },
      {
        Header: 'Amount',
        accessor: 'amount' as keyof LoanApplication,
        Cell: ({ value }: { value: number }) => `$${value.toLocaleString()}`,
      },
      {
        Header: 'Tenure',
        accessor: 'tenure' as keyof LoanApplication,
        Cell: ({ value }: { value: number }) => `${value} months`,
      },
      {
        Header: 'Application Date',
        accessor: 'applicationDate' as keyof LoanApplication,
        Cell: ({ value }: { value: string }) => new Date(value).toLocaleDateString(),
      },
      {
        Header: 'Status',
        accessor: 'status' as keyof LoanApplication,
        Cell: ({ value }: { value: string }) => <ApplicationStatusBadge status={value} />,
      },
      {
        Header: 'Actions',
        accessor: 'id' as keyof LoanApplication,
        Cell: ({ row }: any) => (
          <div className="flex space-x-2">
            <button
              onClick={() => router.push(`/loans/applications/${row.original.id}`)}
              className="text-primary-600 hover:text-primary-900"
            >
              View
            </button>
            {row.original.status === 'APPROVED' && (
              <button
                onClick={() => router.push(`/loans/applications/${row.original.id}/documents`)}
                className="text-primary-600 hover:text-primary-900"
              >
                Upload Docs
              </button>
            )}
          </div>
        ),
      },
    ],
    [router]
  );

  const handleRowClick = (row: any) => {
    router.push(`/loans/applications/${row.original.id}`);
  };

  // Mock data for now
  const mockApplications: LoanApplication[] = [
    {
      id: 'LA-1001',
      userId: 'user-1',
      loanTypeId: '1',
      amount: 10000,
      tenure: 12,
      purpose: 'Home renovation',
      status: 'PENDING',
      applicationDate: '2023-12-01',
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
        processingFeePercent: 2,
        lateFeeAmount: 500,
        isActive: true,
      },
    },
    {
      id: 'LA-1002',
      userId: 'user-1',
      loanTypeId: '2',
      amount: 25000,
      tenure: 24,
      purpose: 'Business expansion',
      status: 'APPROVED',
      applicationDate: '2023-11-15',
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
        processingFeePercent: 2,
        lateFeeAmount: 500,
        isActive: true,
      },
    },
    {
      id: 'LA-1003',
      userId: 'user-1',
      loanTypeId: '3',
      amount: 15000,
      tenure: 36,
      purpose: 'Education',
      status: 'REJECTED',
      applicationDate: '2023-10-20',
      notes: 'Insufficient income documentation',
      loanType: {
        id: '3',
        name: 'Education Loan',
        code: 'EL',
        interestType: 'DIMINISHING',
        minAmount: 10000,
        maxAmount: 100000,
        minTenure: 12,
        maxTenure: 84,
        processingFeePercent: 1.5,
        lateFeeAmount: 300,
        interestRate: 10,
        isActive: true,
      },
    },
  ];

  return (
    <ProtectedRoute>
      <MainLayout title="Loan Applications">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Loan Applications</h1>
              <p className="mt-1 text-sm text-gray-500">
                View and track your loan applications
              </p>
            </div>
            <Button
              variant="primary"
              icon={<PlusIcon className="h-5 w-5 mr-2" />}
              onClick={() => router.push('/loans/apply')}
            >
              New Application
            </Button>
          </div>

          <Card>
            <div className="px-4 py-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Application List</h3>
                <div className="mt-3 sm:mt-0 flex items-center space-x-2">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                  <select
                    className="form-input py-1 pl-2 pr-8"
                    value={filter.status}
                    onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                  >
                    <option value="">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="DISBURSED">Disbursed</option>
                  </select>
                </div>
              </div>

              <Table
                columns={columns as any}
                data={mockApplications}
                isLoading={false}
                onRowClick={handleRowClick}
                emptyMessage="You don't have any loan applications yet. Apply for a loan to get started."
              />
            </div>
          </Card>

          <Card title="Application Process">
            <div className="px-4 py-5 sm:p-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-between">
                  <div className="flex items-center">
                    <span className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                      <span className="text-white font-medium">1</span>
                    </span>
                    <span className="ml-3 text-sm font-medium text-gray-900">Apply</span>
                  </div>
                  <div className="flex items-center">
                    <span className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                      <span className="text-white font-medium">2</span>
                    </span>
                    <span className="ml-3 text-sm font-medium text-gray-900">Approval</span>
                  </div>
                  <div className="flex items-center">
                    <span className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                      <span className="text-white font-medium">3</span>
                    </span>
                    <span className="ml-3 text-sm font-medium text-gray-900">Documentation</span>
                  </div>
                  <div className="flex items-center">
                    <span className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                      <span className="text-white font-medium">4</span>
                    </span>
                    <span className="ml-3 text-sm font-medium text-gray-900">Disbursement</span>
                  </div>
                </div>
              </div>
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">1. Apply</h4>
                  <p className="mt-2 text-sm text-gray-500">
                    Fill out the loan application form with your personal and financial details.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">2. Approval</h4>
                  <p className="mt-2 text-sm text-gray-500">
                    Our team reviews your application and makes a decision based on your eligibility.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">3. Documentation</h4>
                  <p className="mt-2 text-sm text-gray-500">
                    Upload required documents to verify your identity, address, and income.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">4. Disbursement</h4>
                  <p className="mt-2 text-sm text-gray-500">
                    Once approved and verified, the loan amount is disbursed to your account.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default LoanApplicationsPage;