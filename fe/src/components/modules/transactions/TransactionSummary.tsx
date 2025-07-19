import React from 'react';
import { TransactionSummary as TransactionSummaryType } from '../../../services/transaction.service';
import { formatCurrency } from '../../../utils/dateUtils';

interface TransactionSummaryProps {
  summary: TransactionSummaryType | null;
  loading?: boolean;
  title?: string;
}

const TransactionSummary: React.FC<TransactionSummaryProps> = ({
  summary,
  loading = false,
  title = 'Transaction Summary'
}) => {
  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <p className="text-gray-500">No transaction data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500">Total Deposits</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{formatCurrency(summary.totalDeposits)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500">Total Withdrawals</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{formatCurrency(summary.totalWithdrawals)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500">Interest Earned</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{formatCurrency(summary.totalInterestEarned)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500">Total Fees</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{formatCurrency(summary.totalFees)}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Total Transactions: {summary.transactionCount}
          </p>
          {summary.lastTransactionDate && (
            <p className="text-sm text-gray-500">
              Last Transaction: {new Date(summary.lastTransactionDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionSummary;