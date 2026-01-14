import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import MainLayout from '../../../components/layout/MainLayout';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import Button from '../../../components/common/Button';
import chartOfAccountsService, { Account } from '../../../services/chart-of-accounts.service';

const CreateAccountPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [parentAccounts, setParentAccounts] = useState<Account[]>([]);
  const [formData, setFormData] = useState({
    accountName: '',
    accountCode: '',
    accountType: '',
    description: '',
    parentAccountId: '',
    isActive: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchParentAccounts();
  }, []);

  const fetchParentAccounts = async () => {
    try {
      const accounts = await chartOfAccountsService.getAllAccounts();
      setParentAccounts(accounts);
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
    
    if (!formData.accountCode.trim()) {
      newErrors.accountCode = 'Account code is required';
    } else if (formData.accountCode.length < 2 || formData.accountCode.length > 20) {
      newErrors.accountCode = 'Account code must be between 2 and 20 characters';
    } else if (!/^[A-Z0-9-]+$/.test(formData.accountCode)) {
      newErrors.accountCode = 'Account code must contain only uppercase letters, numbers, and hyphens';
    }
    
    if (!formData.accountType) {
      newErrors.accountType = 'Account type is required';
    }
    
    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Description cannot exceed 200 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      await chartOfAccountsService.createAccount({
        accountName: formData.accountName,
        accountCode: formData.accountCode,
        accountType: formData.accountType as any,
        description: formData.description || undefined,
        parentAccountId: formData.parentAccountId || undefined,
        isActive: formData.isActive
      });
      
      toast.success('Account created successfully');
      router.push('/accounting/chart-of-accounts');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/accounting/chart-of-accounts');
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Create New Account</h1>
            <p className="mt-1 text-sm text-gray-500">
              Add a new account to the chart of accounts
            </p>
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
                    Account Code *
                  </label>
                  <input
                    type="text"
                    name="accountCode"
                    id="accountCode"
                    value={formData.accountCode}
                    onChange={handleChange}
                    className={`mt-1 block w-full border ${
                      errors.accountCode ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                  {errors.accountCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.accountCode}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="accountType" className="block text-sm font-medium text-gray-700">
                    Account Type *
                  </label>
                  <select
                    id="accountType"
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleChange}
                    className={`mt-1 block w-full border ${
                      errors.accountType ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  >
                    <option value="">Select Account Type</option>
                    <option value="ASSET">Asset</option>
                    <option value="LIABILITY">Liability</option>
                    <option value="EQUITY">Equity</option>
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                  {errors.accountType && (
                    <p className="mt-1 text-sm text-red-600">{errors.accountType}</p>
                  )}
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">No Parent (Top Level)</option>
                    {parentAccounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.accountCode} - {account.name}
                      </option>
                    ))}
                  </select>
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
                  {loading ? 'Creating...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </div>
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

export default CreateAccountPage;
