import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';

import MainLayout from '@/components/layout/MainLayout';
import { formatCurrency } from '@/utils/format';
import loanService, { LoanType } from '@/services/loanService';
import { useAuth } from '@/contexts/AuthContext';
import { EditIcon, DeleteIcon, AddIcon } from '@/components/common/Icons';

const LoanTypesPage: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const [showInactive, setShowInactive] = useState(false);
  const [selectedLoanType, setSelectedLoanType] = useState<LoanType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch loan types
  const { data: loanTypesResponse, isLoading, error } = useQuery(
    ['loanTypes', showInactive],
    () => loanService.getLoanTypes(),
    {
      keepPreviousData: true,
    }
  );

  // Extract loan types data from the response
  const loanTypes = loanTypesResponse?.data || [];

  // Delete loan type mutation
  const deleteMutation = useMutation(
    (id: string) => loanService.deleteLoanType(id),
    {
      onSuccess: () => {
        toast.success('Loan type deleted successfully');
        queryClient.invalidateQueries('loanTypes');
        setDeleteDialogOpen(false);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to delete loan type');
      },
    }
  );

  const handleDeleteClick = (loanType: LoanType) => {
    setSelectedLoanType(loanType);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedLoanType) {
      deleteMutation.mutate(selectedLoanType.id);
    }
  };

  const handleEditClick = (id: string) => {
    router.push(`/loans/types/${id}`);
  };

  const handleAddClick = () => {
    router.push('/loans/types/new');
  };

  const filteredLoanTypes = showInactive
    ? loanTypes
    : loanTypes?.filter((type: LoanType) => type.isActive);

  if (isLoading) {
    return (
      <MainLayout title="Loan Types">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="spinner mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Loan Types">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 p-6 rounded-md my-8 mx-auto max-w-2xl text-center">
            <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center mx-auto mb-4">!</div>
            <h2 className="text-lg font-semibold mb-2">An error occurred</h2>
            <p className="mb-4">{(error as Error).message || 'Something went wrong. Please try again later.'}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Loan Types">
      <div className="container mx-auto px-4">
        <div className="mt-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold mb-1">Loan Types</h1>
              <p className="text-gray-600">Manage loan products offered by your organization</p>
            </div>
            <div>
              {hasPermission('loans.create') && (
                <button
                  className="btn btn-primary flex items-center"
                  onClick={handleAddClick}
                >
                  <span className="mr-2"><AddIcon /></span>
                  Add Loan Type
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-body">
            <div className="flex justify-end mb-2">
              <div className="flex items-center">
                <label htmlFor="show-inactive" className="mr-2 text-sm">
                  Show inactive loan types
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="show-inactive"
                    checked={showInactive}
                    onChange={(e) => setShowInactive(e.target.checked)}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="show-inactive"
                    className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                  ></label>
                </div>
              </div>
            </div>

            {filteredLoanTypes?.length === 0 ? (
              <div className="py-10 px-6 text-center border border-dashed border-gray-200 bg-gray-50 rounded-lg">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                    📦
                  </div>
                  <p className="font-bold text-lg mb-2">No loan types found</p>
                  <p className="text-gray-600 max-w-md mx-auto mb-4">
                    Create your first loan type to get started
                  </p>
                  {hasPermission('loans.create') && (
                    <button
                      className="btn btn-primary"
                      onClick={handleAddClick}
                    >
                      Add Loan Type
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Name</th>
                      <th className="table-header-cell">Code</th>
                      <th className="table-header-cell">Interest Type</th>
                      <th className="table-header-cell">Interest Rate</th>
                      <th className="table-header-cell">Amount Range</th>
                      <th className="table-header-cell">Tenure Range</th>
                      <th className="table-header-cell">Status</th>
                      <th className="table-header-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {filteredLoanTypes?.map((loanType: LoanType) => (
                      <tr key={loanType.id} className="table-row">
                        <td className="table-cell">{loanType.name}</td>
                        <td className="table-cell">{loanType.code}</td>
                        <td className="table-cell">
                          {loanType.interestType === 'FLAT' ? 'Flat Rate' : 'Reducing Balance'}
                        </td>
                        <td className="table-cell">{loanType.interestRate}%</td>
                        <td className="table-cell">
                          {formatCurrency(loanType.minAmount)} - {formatCurrency(loanType.maxAmount)}
                        </td>
                        <td className="table-cell">
                          {loanType.minTenure} - {loanType.maxTenure} months
                        </td>
                        <td className="table-cell">
                          <span
                            className={`badge ${loanType.isActive ? 'badge-success' : 'badge-secondary'}`}
                          >
                            {loanType.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="table-cell">
                          {hasPermission('loans.edit') && (
                            <button
                              className="p-1 mr-2 text-blue-600 hover:text-blue-800 rounded"
                              title="Edit"
                              onClick={() => handleEditClick(loanType.id)}
                            >
                              <EditIcon />
                            </button>
                          )}
                          {hasPermission('loans.delete') && (
                            <button
                              className="p-1 text-red-600 hover:text-red-800 rounded"
                              title="Delete"
                              onClick={() => handleDeleteClick(loanType)}
                              disabled={!loanType.isActive}
                            >
                              <DeleteIcon />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {deleteDialogOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Loan Type</h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete the loan type "{selectedLoanType?.name}"? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="btn btn-danger ml-3"
                    onClick={handleDeleteConfirm}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setDeleteDialogOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default LoanTypesPage;