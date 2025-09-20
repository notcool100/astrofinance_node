import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import MainLayout from '../../../../components/layout/MainLayout';
import ProtectedRoute from '../../../../components/common/ProtectedRoute';
import Button from '../../../../components/common/Button';
import chartOfAccountsService, { Account } from '../../../../services/chart-of-accounts.service';

const EditAccountPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [parentAccounts, setParentAccounts] = useState<Account[]>([]);
  const [formData, setFormData] = useState({
    accountName: '',
    description: '',
    parentAccountId: '',
    isActive: true
  });
  const [accountDetails, setAccountDetails] = useState<Account | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (router.isReady && id) {
      fetchAccountDetails();
      fetchParentAccounts();
    }
  }, [router.isReady, id]);

  const fetchAccountDetails = async () => {
    if (typeof id !== 'string') return;
    
    setFetchingData(true);
    try {
      const account = await chartOfAccountsService.getAccountById(id);
      setAccountDetails(account);
      setFormData({
        accountName: account.name,
        description: account.description || '',
        parentAccountId: account.parentId || '',
        isActive: account.isActive
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch account details');
      router.push('/accounting/chart-of-accounts');
    } finally {
      setFetchingData(false);
    }
  };

  const fetchParentAccounts = async () => {
    try {
      const accounts = await chartOfAccountsService.getAllAccounts();
      // Filter out the current account and its children to prevent circular references
      const filteredAccounts = accounts.filter(account => account.id !== id);
      setParentAccounts(filteredAccounts);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch parent accounts');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.accountName.trim()) {
      newErrors.accountName = 'Account name is required';
    } else if (formData.accountName.length < 3 || formData.accountName.length > 100) {
      newErrors.accountName = 'Account name must be between 3 and 100 characters';
    }
    
    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Description cannot exceed 200 characters';
    }
    
    // Prevent setting itself as parent
    if (formData.parentAccountId === id) {
      newErrors.parentAccountId = 'An account cannot be its own parent';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !id || typeof id !== 'string') {
      return;
    }
    
    setLoading(true);
    try {
      await chartOfAccountsService.updateAccount(id, {
        accountName: formData.accountName,
        description: formData.description || undefined,
        parentAccountId: formData.parentAccountId || null,
        isActive: formData.isActive
      });
      
      toast.success('Account updated successfully');
      router.push('/accounting/chart-of-accounts');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update account');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/accounting/chart-of-accounts');
  };

  if (fetchingData) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">Loading account details...</div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Edit Account</h1>
            {accountDetails && (
              <p className="mt-1 text-sm text-gray-500">
                Editing {accountDetails.accountCode} - {accountDetails.name}
              </p>
            )}
          </div>

          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="accountName" className="block text-sm font-medium text-gray-700">
                    Account Name *
                  </label>
                  <input
                    type="text"
                    name="accountName"
                    id="accountName"
                    value={formData.accountName}
                    onChange={handleChange}
                    className={`mt-1 block w-full border ${
                      errors.accountName ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                  {errors.accountName && (
                    <p className="mt-1 text-sm text-red-600">{errors.accountName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="accountCode" className="block text-sm font-medium text-gray-700">
                    Account Code
                  </label>
                  <input
                    type="text"
                    id="accountCode"
                    value={accountDetails?.accountCode || ''}
                    disabled
                    className="mt-1 block w-full border border-gray-300 bg-gray-50 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">Account code cannot be changed</p>
                </div>

                <div>
                  <label htmlFor="accountType" className="block text-sm font-medium text-gray-700">
                    Account Type
                  </label>
                  <input
                    type="text"
                    id="accountType"
                    value={accountDetails?.accountType || ''}
                    disabled
                    className="mt-1 block w-full border border-gray-300 bg-gray-50 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">Account type cannot be changed</p>
                </div>

                <div>
                  <label htmlFor="parentAccountId" className="block text-sm font-medium text-gray-700">
                    Parent Account
                  </label>
                  <select
                    id="parentAccountId"
                    name="parentAccountId"
                    value={formData.parentAccountId}
                    onChange={handleChange}
                    className={`mt-1 block w-full border ${
                      errors.parentAccountId ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  >
                    <option value="">No Parent (Top Level)</option>
                    {parentAccounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.accountCode} - {account.name}
                      </option>
                    ))}
                  </select>
                  {errors.parentAccountId && (
                    <p className="mt-1 text-sm text-red-600">{errors.parentAccountId}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className={`mt-1 block w-full border ${
                      errors.description ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default EditAccountPage;