import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeftIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import MainLayout from '../../../components/layout/MainLayout';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import financialReportService, { IncomeStatement } from '../../../services/financial-report.service';

const IncomeStatementPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatement | null>(null);
  
  // Default to current year
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState<string>(() => {
    const firstDayOfYear = new Date(currentYear, 0, 1);
    const year = firstDayOfYear.getFullYear();
    const month = String(firstDayOfYear.getMonth() + 1).padStart(2, '0');
    const day = String(firstDayOfYear.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // YYYY-MM-DD format
  });
  
  const [endDate, setEndDate] = useState<string>(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // YYYY-MM-DD format
  });

  useEffect(() => {
    fetchIncomeStatement();
  }, []);

  const fetchIncomeStatement = async () => {
    setLoading(true);
    try {
      // Use a direct approach to fetch the data
      console.log('Fetching income statement for period:', startDate, 'to', endDate);
      
      // Call the service and get the data
      const data = await financialReportService.getIncomeStatement(startDate, endDate);
      console.log('Income statement data received:', data);
      
      if (!data) {
        console.error('No data returned from income statement API');
        toast.error('Failed to fetch income statement data');
        setLoading(false);
        return;
      }
      
      // Calculate actual totals from the accounts regardless of what the API returns
      interface Account {
        id: string | number;
        accountCode: string;
        name: string;
        balance: number;
      }

      const calculateTotal = (accounts: Account[] | undefined): number => {
        if (!Array.isArray(accounts)) return 0;
        return accounts.reduce((sum, account) => sum + (Number(account.balance) || 0), 0);
      };
      
      // Create a properly formatted income statement object
      const totalIncome = calculateTotal(data.incomeAccounts);
      const totalExpenses = calculateTotal(data.expenseAccounts);
      const netIncome = totalIncome - totalExpenses;
      
      const processedData = {
        period: {
          startDate: data.period?.startDate || startDate,
          endDate: data.period?.endDate || endDate
        },
        incomeAccounts: Array.isArray(data.incomeAccounts) ? data.incomeAccounts : [],
        expenseAccounts: Array.isArray(data.expenseAccounts) ? data.expenseAccounts : [],
        totalIncome: Math.abs(totalIncome), // Income is typically stored as negative in accounting systems
        totalExpenses: Math.abs(totalExpenses),
        netIncome: netIncome
      };
      
      console.log('Processed income statement data:', processedData);
      setIncomeStatement(processedData);
    } catch (error) {
      console.error('Error fetching income statement:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch income statement');
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    console.log('Start date changed to:', dateValue);
    setStartDate(dateValue);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    console.log('End date changed to:', dateValue);
    setEndDate(dateValue);
  };

  const handleGenerateReport = () => {
    fetchIncomeStatement();
  };

  const handleExportPDF = async () => {
    setExportLoading(true);
    try {
      const blob = await financialReportService.exportReport(
        'income-statement',
        'pdf',
        { startDate, endDate }
      );
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `income-statement-${startDate}-to-${endDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Income statement exported successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to export income statement');
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setExportLoading(true);
    try {
      const blob = await financialReportService.exportReport(
        'income-statement',
        'excel',
        { startDate, endDate }
      );
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `income-statement-${startDate}-to-${endDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Income statement exported successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to export income statement');
    } finally {
      setExportLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    const formattedNumber = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return `Rs ${formattedNumber}`;
  };

  const formatDate = (dateString: string) => {
    try {
      // Handle ISO date format (e.g., "2025-08-01T00:00:00.000Z")
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date format:', dateString);
        return dateString; // Return original if invalid
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // Return original on error
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <Button
                variant="secondary"
                className="mr-4"
                onClick={() => router.push('/accounting/reports')}
              >
                <ArrowLeftIcon className="h-5 w-5 mr-1" />
                Back to Reports
              </Button>
              <h1 className="text-2xl font-semibold text-gray-900">Income Statement</h1>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                onClick={handleExportPDF}
                disabled={exportLoading || loading || !incomeStatement}
              >
                <DocumentArrowDownIcon className="h-5 w-5 mr-1" />
                Export PDF
              </Button>
              <Button
                variant="secondary"
                onClick={handleExportExcel}
                disabled={exportLoading || loading || !incomeStatement}
              >
                <DocumentArrowDownIcon className="h-5 w-5 mr-1" />
                Export Excel
              </Button>
            </div>
          </div>

          <Card className="mb-6">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Report Parameters</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={startDate}
                    onChange={handleStartDateChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={endDate}
                    onChange={handleEndDateChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    variant="primary"
                    onClick={handleGenerateReport}
                    disabled={loading}
                    className="w-full md:w-auto"
                  >
                    {loading ? 'Generating...' : 'Generate Report'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-500">Loading income statement...</p>
            </div>
          ) : incomeStatement ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Income Statement for {formatDate(incomeStatement.period.startDate)} to {formatDate(incomeStatement.period.endDate)}
                </h3>
              </div>
              
              {/* Revenue Section */}
              <div className="border-b border-gray-200">
                <div className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </div>
                <div className="divide-y divide-gray-200">
                  {incomeStatement.incomeAccounts.length > 0 ? (
                    incomeStatement.incomeAccounts.map(account => (
                      <div key={account.id} className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-sm font-medium text-gray-500">
                          {account.accountCode} - {account.name}
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 text-right">
                          {formatCurrency(account.balance)}
                        </dd>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 italic">
                      No revenue accounts with balances
                    </div>
                  )}
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 font-bold bg-gray-50">
                    <dt className="text-sm text-gray-900">Total Revenue</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 text-right">
                      {formatCurrency(incomeStatement.totalIncome)}
                    </dd>
                  </div>
                </div>
              </div>
              
              {/* Expenses Section */}
              <div className="border-b border-gray-200">
                <div className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expenses
                </div>
                <div className="divide-y divide-gray-200">
                  {incomeStatement.expenseAccounts.length > 0 ? (
                    incomeStatement.expenseAccounts.map(account => (
                      <div key={account.id} className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-sm font-medium text-gray-500">
                          {account.accountCode} - {account.name}
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 text-right">
                          {formatCurrency(account.balance)}
                        </dd>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 italic">
                      No expense accounts with balances
                    </div>
                  )}
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 font-bold bg-gray-50">
                    <dt className="text-sm text-gray-900">Total Expenses</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 text-right">
                      {formatCurrency(incomeStatement.totalExpenses)}
                    </dd>
                  </div>
                </div>
              </div>
              
              {/* Net Income */}
              <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 font-bold bg-gray-100">
                <dt className="text-sm text-gray-900">Net Income</dt>
                <dd className={`mt-1 text-sm sm:mt-0 sm:col-span-2 text-right ${
                  incomeStatement.netIncome >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(incomeStatement.netIncome)}
                </dd>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No income statement data available. Please generate a report.</p>
            </div>
          )}
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

export default IncomeStatementPage;
