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
import Modal from '../../../components/common/Modal';
import ClientOnly from '../../../components/common/ClientOnly';
import transactionService, { Transaction } from '../../../services/transaction.service';
import { formatCurrency } from '../../../utils/dateUtils';

const TransactionDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    // Only fetch data when id is available and router is ready
    if (router.isReady && id && typeof id === 'string') {
      fetchTransaction(id);
    }
  }, [router.isReady, id]);

  const fetchTransaction = async (transactionId: string) => {
    setLoading(true);
    try {
      const data = await transactionService.getTransactionById(transactionId);
      setTransaction(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTransaction = async () => {
    if (!transaction) return;
    
    setCancelLoading(true);
    try {
      await transactionService.cancelTransaction({
        id: transaction.id,
        reason: cancelReason
      });
      
      toast.success('The transaction has been successfully cancelled');
      setShowCancelModal(false);
      fetchTransaction(transaction.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleBack = () => {
    if (transaction?.accountId) {
      router.push(`/users/transaction?accountId=${transaction.accountId}`);
    } else {
      router.back();
    }
  };

  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return <Badge color="green" text="Deposit" />;
      case 'WITHDRAWAL':
        return <Badge color="red" text="Withdrawal" />;
      case 'INTEREST_CREDIT':
        return <Badge color="blue" text="Interest Credit" />;
      case 'FEE_DEBIT':
        return <Badge color="orange" text="Fee Debit" />;
      case 'ADJUSTMENT':
        return <Badge color="purple" text="Adjustment" />;
      case 'TRANSFER_IN':
        return <Badge color="teal" text="Transfer In" />;
      case 'TRANSFER_OUT':
        return <Badge color="pink" text="Transfer Out" />;
      default:
        return <Badge color="gray" text="Unknown" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge color="green" text="Completed" />;
      case 'PENDING':
        return <Badge color="yellow" text="Pending" />;
      case 'FAILED':
        return <Badge color="red" text="Failed" />;
      case 'CANCELLED':
        return <Badge color="gray" text="Cancelled" />;
      default:
        return <Badge color="gray" text="Unknown" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return format(date, 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const canCancelTransaction = () => {
    if (!transaction) return false;
    
    // Only completed transactions that are less than 24 hours old can be cancelled
    if (transaction.status !== 'COMPLETED') return false;
    
    const transactionDate = new Date(transaction.transactionDate);
    const now = new Date();
    const hoursDifference = (now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60);
    
    return hoursDifference <= 24;
  };

  if (loading) {
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

  if (!transaction) {
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
                  <h3 className="text-sm font-medium text-red-800">Transaction not found</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>The transaction you're looking for doesn't exist or you don't have permission to view it.</p>
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
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={handleBack}
            >
              <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Back to Transactions
            </Button>
            {canCancelTransaction() && (
              <Button 
                variant="danger" 
                onClick={() => setShowCancelModal(true)}
              >
                Cancel Transaction
              </Button>
            )}
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <ClientOnly>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Transaction Details</h3>
                <div className="flex space-x-2">
                  {getTransactionTypeBadge(transaction.transactionType)}
                  {getStatusBadge(transaction.status)}
                </div>
              </ClientOnly>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Transaction ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{transaction.id}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Account Number</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {transaction.account?.accountNumber || 'N/A'}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Transaction Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatDate(transaction.transactionDate)}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Amount</dt>
                  <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                    <span
                      className={`font-bold text-lg ${
                        ['DEPOSIT', 'INTEREST_CREDIT', 'TRANSFER_IN'].includes(transaction.transactionType)
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(transaction.amount)}
                    </span>
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Reference Number</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {transaction.referenceNumber || 'N/A'}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Transaction Method</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {transaction.transactionMethod || 'N/A'}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {transaction.description || 'No description provided'}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Created At</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatDate(transaction.createdAt)}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatDate(transaction.updatedAt)}
                  </dd>
                </div>
              </dl>
            </div>
            
            {transaction.status === 'CANCELLED' && (
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Cancellation Information</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>This transaction has been cancelled.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {transaction.account?.user && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Account Information</h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200">
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Account Holder</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {transaction.account.user.fullName}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Account ID</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {transaction.account.id}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>

        {/* Cancel Transaction Modal */}
        <Modal
          isOpen={showCancelModal}
          title="Cancel Transaction"
          onClose={() => setShowCancelModal(false)}
        >
          <div className="rounded-md bg-yellow-50 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Warning!</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Cancelling this transaction will create a reversal transaction and adjust the account balance.
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700">
              Reason for Cancellation <span className="text-red-500">*</span>
            </label>
            <textarea
              id="cancelReason"
              name="cancelReason"
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Please provide a reason for cancelling this transaction"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
            >
              Close
            </Button>
            <Button
              variant="danger"
              onClick={handleCancelTransaction}
              loading={cancelLoading}
              disabled={!cancelReason.trim()}
            >
              Confirm Cancellation
            </Button>
          </div>
        </Modal>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default TransactionDetail;