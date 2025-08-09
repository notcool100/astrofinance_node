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

  const columns: Column<LoanApplication>[] = React.useMemo(
    () => [
      {
        Header: 'Application ID',
        accessor: 'id',
        Cell: ({ value }: { value: string }) => (
          <span className="font-mono text-sm">{value.slice(-8).toUpperCase()}</span>
        ),
      },
      {
        Header: 'Application Number',
        accessor: 'applicationNumber' as keyof LoanApplication,
        Cell: ({ value }: { value: string }) => (
          <span className="font-medium">{value || 'N/A'}</span>
        ),
      },
      {
        Header: 'Loan Type',
        accessor: 'loanType' as keyof LoanApplication,
        Cell: ({ row }: any) => (
          <div>
            <div className="font-medium">{row.original.loanType?.name || 'N/A'}</div>
            <div className="text-xs text-gray-500">{row.original.loanType?.code || ''}</div>
          </div>
        ),
      },
      {
        Header: 'Amount Requested',
        accessor: 'amount',
        Cell: ({ value }: { value: number }) => (
          <span className="font-medium">${value.toLocaleString()}</span>
        ),
      },
      {
        Header: 'Tenure',
        accessor: 'tenure',
        Cell: ({ value }: { value: number }) => `${value} months`,
      },
      {
        Header: 'Purpose',
        accessor: 'purpose',
        Cell: ({ value }: { value: string }) => (
          <span className="truncate max-w-32" title={value}>
            {value}
          </span>
        ),
      },
      {
        Header: 'Applied Date',
        accessor: 'appliedDate' as keyof LoanApplication,
        Cell: ({ value }: { value: string }) => {
          const date = value ? new Date(value) : new Date();
          return (
            <div>
              <div>{date.toLocaleDateString()}</div>
              <div className="text-xs text-gray-500">{date.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</div>
            </div>
          );
        },
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }: { value: string }) => <ApplicationStatusBadge status={value} />,
      },
      {
        Header: 'Actions',
        id: 'actions', // Use unique ID instead of accessor
        Cell: ({ row }: any) => (
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/loans/applications/${row.original.id}`);
              }}
              className="text-primary-600 hover:text-primary-900 text-sm font-medium"
            >
              View
            </button>
            {row.original.status === 'APPROVED' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/loans/applications/${row.original.id}/documents`);
                }}
                className="text-green-600 hover:text-green-900 text-sm font-medium"
              >
                Documents
              </button>
            )}
            {row.original.status === 'APPROVED' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/loans/applications/${row.original.id}/agreement`);
                }}
                className="text-blue-600 hover:text-blue-900 text-sm font-medium"
              >
                Agreement
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



  // Filter applications based on filter state
  const filteredApplications = React.useMemo(() => {
    let filtered = applicationsData || [];
    
    if (filter.status) {
      filtered = filtered.filter(app => app.status === filter.status);
    }
    
    if (filter.loanType) {
      filtered = filtered.filter(app => app.loanType?.name === filter.loanType);
    }
    
    return filtered;
  }, [applicationsData, filter]);

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = filteredApplications.length;
    const pending = filteredApplications.filter(app => app.status === 'PENDING').length;
    const approved = filteredApplications.filter(app => app.status === 'APPROVED').length;
    const rejected = filteredApplications.filter(app => app.status === 'REJECTED').length;
    const disbursed = filteredApplications.filter(app => app.status === 'DISBURSED').length;
    const totalAmount = filteredApplications.reduce((sum, app) => sum + app.amount, 0);
    
    return { total, pending, approved, rejected, disbursed, totalAmount };
  }, [filteredApplications]);

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

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <div className="p-4">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-500">Total Applications</div>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
                <div className="text-sm text-gray-500">Pending Review</div>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                <div className="text-sm text-gray-500">Approved</div>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                <div className="text-sm text-gray-500">Rejected</div>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <div className="text-2xl font-bold text-purple-600">${stats.totalAmount.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Total Amount</div>
              </div>
            </Card>
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
                data={filteredApplications}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                emptyMessage={
                  filter.status || filter.loanType 
                    ? "No applications match your filters" 
                    : "You don't have any loan applications yet. Apply for a loan to get started."
                }
                keyField="id"
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