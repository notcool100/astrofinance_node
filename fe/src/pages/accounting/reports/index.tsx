import React, { useState } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '../../../components/layout/MainLayout';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import {
  DocumentTextIcon,
  DocumentChartBarIcon,
  CurrencyDollarIcon,
  ScaleIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

const ReportsPage: React.FC = () => {
  const router = useRouter();

  const reportTypes = [
    {
      id: 'balance-sheet',
      name: 'Balance Sheet',
      description: 'View assets, liabilities, and equity at a specific date',
      icon: <ScaleIcon className="h-8 w-8 text-indigo-500" />,
      path: '/accounting/reports/balance-sheet'
    },
    {
      id: 'income-statement',
      name: 'Income Statement',
      description: 'View revenue, expenses, and profit/loss for a period',
      icon: <CurrencyDollarIcon className="h-8 w-8 text-green-500" />,
      path: '/accounting/reports/income-statement'
    },
    {
      id: 'trial-balance',
      name: 'Trial Balance',
      description: 'View debit and credit balances for all accounts',
      icon: <DocumentChartBarIcon className="h-8 w-8 text-blue-500" />,
      path: '/accounting/reports/trial-balance'
    },
    {
      id: 'general-ledger',
      name: 'General Ledger',
      description: 'View detailed transaction history for accounts',
      icon: <BookOpenIcon className="h-8 w-8 text-purple-500" />,
      path: '/accounting/reports/general-ledger'
    }
  ];

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Financial Reports</h1>
            <p className="mt-2 text-sm text-gray-700">
              Generate and view financial reports for your organization
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {reportTypes.map((report) => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-50 mb-4">
                    {report.icon}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">{report.name}</h3>
                  <p className="mt-2 text-sm text-gray-500">{report.description}</p>
                  <div className="mt-4">
                    <Button
                      variant="primary"
                      onClick={() => router.push(report.path)}
                      className="w-full"
                    >
                      View Report
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default ReportsPage;