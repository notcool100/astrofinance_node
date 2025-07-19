import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import MainLayout from '../../../components/layout/MainLayout';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import ClientOnly from '../../../components/common/ClientOnly';
import transactionService, { CreateTransactionData } from '../../../services/transaction.service';
import { getAccountById, Account, getAllUsers, getUserAccounts, User } from '../../../services/user.service';
import { formatCurrency } from '../../../utils/dateUtils';

const CreateTransaction: React.FC = () => {
  const router = useRouter();
  const { accountId } = router.query;

  const [account, setAccount] = useState<Account | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [userAccounts, setUserAccounts] = useState<Account[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [accountLoading, setAccountLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [formData, setFormData] = useState<CreateTransactionData>({
    accountId: '',
    transactionType: 'DEPOSIT',
    amount: 0,
    description: '',
    referenceNumber: '',
    transactionMethod: '',
    transactionDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch all users when component mounts
    fetchUsers();
    
    // If accountId is provided, set it and fetch account details
    if (router.isReady && accountId && typeof accountId === 'string') {
      setFormData(prev => ({ ...prev, accountId }));
      fetchAccountDetails(accountId);
    }
  }, [router.isReady, accountId]);

  // Fetch user accounts when a user is selected
  useEffect(() => {
    if (selectedUserId) {
      fetchUserAccounts(selectedUserId);
    }
  }, [selectedUserId]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      console.log('Fetching users...');
      const response = await getAllUsers(1, 100, '', 'true');
      console.log('Users fetched:', response);
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load users');
      setUsers([]); // Set empty array to prevent undefined errors
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchUserAccounts = async (userId: string) => {
    setAccountLoading(true);
    try {
      console.log('Fetching accounts for user:', userId);
      const response = await getUserAccounts(userId, 1, 100, undefined, 'ACTIVE');
      console.log('User accounts fetched:', response);
      setUserAccounts(response.data || []);
      
      // If there are accounts and none is selected yet, select the first one
      if (response.data && response.data.length > 0 && !formData.accountId) {
        const firstAccount = response.data[0];
        setFormData(prev => ({ ...prev, accountId: firstAccount.id }));
        fetchAccountDetails(firstAccount.id);
      }
    } catch (error) {
      console.error('Error fetching user accounts:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load user accounts');
      setUserAccounts([]); // Set empty array to prevent undefined errors
    } finally {
      setAccountLoading(false);
    }
  };

  const fetchAccountDetails = async (id: string) => {
    setAccountLoading(true);
    try {
      console.log('Fetching account details for:', id);
      const accountData = await getAccountById(id);
      console.log('Account details fetched:', accountData);
      setAccount(accountData);
      
      // If account has user info, set the selected user
      if (accountData.user?.id) {
        setSelectedUserId(accountData.user.id);
      }
      
      // Check if account is active
      if (accountData.status !== 'ACTIVE') {
        toast.warning(`This account is currently ${accountData.status.toLowerCase()}. Transactions can only be performed on active accounts.`);
      }
    } catch (error) {
      console.error('Error fetching account details:', error);
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
      setAccount(null); // Reset account to prevent undefined errors
    } finally {
      setAccountLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedUserId) {
      newErrors.userId = 'User selection is required';
    }
    
    if (!formData.accountId) {
      newErrors.accountId = 'Account selection is required';
    }
    
    if (!formData.transactionType) {
      newErrors.transactionType = 'Transaction type is required';
    }
    
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (formData.transactionType === 'WITHDRAWAL' && account && formData.amount > account.balance) {
      newErrors.amount = 'Withdrawal amount cannot exceed account balance';
    }
    
    if (!formData.transactionDate) {
      newErrors.transactionDate = 'Transaction date is required';
    } else {
      const transactionDate = new Date(formData.transactionDate);
      const now = new Date();
      if (transactionDate > now) {
        newErrors.transactionDate = 'Transaction date cannot be in the future';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // If account is selected, fetch its details
    if (name === 'accountId' && value) {
      fetchAccountDetails(value);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setFormData(prev => ({ ...prev, amount: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await transactionService.createTransaction(formData);
      
      toast.success('The transaction has been successfully created');
      
      // Redirect back to transactions list
      router.push(`/users/transaction?accountId=${formData.accountId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // Only show loading spinner when we're waiting for an account ID that was provided
  if (accountLoading && accountId) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  // Only show error if we were expecting an account but couldn't find it
  if (accountId && !account && !accountLoading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Account not found</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>The account you're trying to create a transaction for doesn't exist or you don't have permission to access it.</p>
                  </div>
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={() => router.back()}
            >
              <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Go Back
            </Button>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <ClientOnly>
              <h1 className="text-2xl font-semibold text-gray-900">Create New Transaction</h1>
            </ClientOnly>
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={handleCancel}
            >
              <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Cancel
            </Button>
          </div>

          {/* Account Information Section */}
          {formData.accountId && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Account Information</h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                {accountLoading ? (
                  <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                  </div>
                ) : account ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Account Number</p>
                        <p className="mt-1 text-sm text-gray-900">{account.accountNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Account Type</p>
                        <p className="mt-1 text-sm text-gray-900">{account.accountType}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Current Balance</p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(account.balance)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <p className="mt-1 text-sm text-gray-900">{account.status}</p>
                      </div>
                    </div>
                    {account.status !== 'ACTIVE' && (
                      <div className="mt-4 rounded-md bg-yellow-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                              This account is {account.status.toLowerCase()}. Transactions can only be performed on active accounts.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500">Account information could not be loaded</p>
                )}
              </div>
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Transaction Details</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {/* User Selection */}
                  <div className="sm:col-span-3">
                    <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                      Select User <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative">
                      {usersLoading && (
                        <div className="absolute right-2 top-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-500"></div>
                        </div>
                      )}
                      <select
                        id="userId"
                        name="userId"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        disabled={!!accountId || usersLoading}
                      >
                        <option value="">Select a user</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.fullName} ({user.contactNumber})
                          </option>
                        ))}
                      </select>
                      {errors.userId && <p className="mt-2 text-sm text-red-600">{errors.userId}</p>}
                    </div>
                  </div>

                  {/* Account Selection */}
                  <div className="sm:col-span-3">
                    <label htmlFor="accountId" className="block text-sm font-medium text-gray-700">
                      Select Account <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative">
                      {selectedUserId && accountLoading && (
                        <div className="absolute right-2 top-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-500"></div>
                        </div>
                      )}
                      <select
                        id="accountId"
                        name="accountId"
                        value={formData.accountId}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        disabled={!selectedUserId || accountLoading || !!accountId}
                      >
                        <option value="">Select an account</option>
                        {userAccounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.accountNumber} ({acc.accountType}) - {formatCurrency(acc.balance)}
                          </option>
                        ))}
                      </select>
                      {errors.accountId && <p className="mt-2 text-sm text-red-600">{errors.accountId}</p>}
                      {selectedUserId && userAccounts.length === 0 && !accountLoading && (
                        <p className="mt-2 text-sm text-amber-600">No active accounts found for this user</p>
                      )}
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700">
                      Transaction Type <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <select
                        id="transactionType"
                        name="transactionType"
                        value={formData.transactionType}
                        onChange={handleInputChange}
                        disabled={account?.status !== 'ACTIVE'}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="DEPOSIT">Deposit</option>
                        <option value="WITHDRAWAL">Withdrawal</option>
                        <option value="INTEREST_CREDIT">Interest Credit</option>
                        <option value="FEE_DEBIT">Fee Debit</option>
                        <option value="ADJUSTMENT">Adjustment</option>
                        <option value="TRANSFER_IN">Transfer In</option>
                        <option value="TRANSFER_OUT">Transfer Out</option>
                      </select>
                    </div>
                    {errors.transactionType && (
                      <p className="mt-2 text-sm text-red-600">{errors.transactionType}</p>
                    )}
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="amount"
                        id="amount"
                        min="0.01"
                        step="0.01"
                        value={formData.amount}
                        onChange={handleAmountChange}
                        disabled={account?.status !== 'ACTIVE'}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                    {errors.amount && (
                      <p className="mt-2 text-sm text-red-600">{errors.amount}</p>
                    )}
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="transactionDate" className="block text-sm font-medium text-gray-700">
                      Transaction Date <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="date"
                        name="transactionDate"
                        id="transactionDate"
                        value={formData.transactionDate}
                        onChange={handleInputChange}
                        max={format(new Date(), 'yyyy-MM-dd')}
                        disabled={account?.status !== 'ACTIVE'}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                    {errors.transactionDate && (
                      <p className="mt-2 text-sm text-red-600">{errors.transactionDate}</p>
                    )}
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="transactionMethod" className="block text-sm font-medium text-gray-700">
                      Transaction Method
                    </label>
                    <div className="mt-1">
                      <select
                        id="transactionMethod"
                        name="transactionMethod"
                        value={formData.transactionMethod || ''}
                        onChange={handleInputChange}
                        disabled={account?.status !== 'ACTIVE'}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="">Select method (optional)</option>
                        <option value="CASH">Cash</option>
                        <option value="CHEQUE">Cheque</option>
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                        <option value="ONLINE">Online</option>
                        <option value="MOBILE">Mobile</option>
                        <option value="ATM">ATM</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="referenceNumber" className="block text-sm font-medium text-gray-700">
                      Reference Number
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="referenceNumber"
                        id="referenceNumber"
                        value={formData.referenceNumber || ''}
                        onChange={handleInputChange}
                        disabled={account?.status !== 'ACTIVE'}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Reference number (optional)"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        value={formData.description || ''}
                        onChange={handleInputChange}
                        disabled={account?.status !== 'ACTIVE'}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Transaction description (optional)"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-gray-200 pt-6">
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={account?.status !== 'ACTIVE'}
                    >
                      Create Transaction
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default CreateTransaction;