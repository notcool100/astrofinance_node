import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeftIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import MainLayout from '../../../components/layout/MainLayout';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import financialReportService, { TrialBalance } from '../../../services/financial-report.service';

const TrialBalancePage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [trialBalance, setTrialBalance] = useState<TrialBalance | null>(null);
  // Initialize with today's date in YYYY-MM-DD format
  const [asOfDate, setAsOfDate] = useState<string>(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // YYYY-MM-DD format
  });

  useEffect(() => {
    fetchTrialBalance();
  }, []);

  const fetchTrialBalance = async () => {
    setLoading(true);
    try {
      // Use a direct approach to fetch the data
      const formattedDate = asOfDate.split('T')[0]; // Ensure we're using YYYY-MM-DD format
      console.log('Fetching trial balance for date:', formattedDate);
      
      // Call the service and get the data
      const data = await financialReportService.getTrialBalance(formattedDate);
      console.log('Trial balance data received:', data);
      
      if (!data) {
        console.error('No data returned from trial balance API');
        toast.error('Failed to fetch trial balance data');
        setLoading(false);
        return;
      }
      
      // Process the data based on the API response format
      // The API might return a flat list of accounts instead of categorized accounts
      if (data.accounts) {
        // Data is already in the expected format
        setTrialBalance(data);
      } else if (data.asOfDate && Array.isArray(data.accounts)) {
        // Data is in the expected format
        setTrialBalance(data);
      } else {
        // Handle the case where the API returns a different format
        // For example, if it returns a flat list of accounts
        const accounts = Array.isArray(data) ? data : 
                        (data.accounts ? data.accounts : []);
        
        // Calculate totals
        let totalDebit = 0;
        let totalCredit = 0;
        
        accounts.forEach(account => {
          const { debit, credit } = getAccountBalances(account);
          totalDebit += debit;
          totalCredit += credit;
        });
        
        const processedData = {
          asOfDate: data.asOfDate || formattedDate,
          accounts: accounts,
          totals: {
            debit: totalDebit,
            credit: totalCredit,
            difference: totalDebit - totalCredit
          }
        };
        
        console.log('Processed trial balance data:', processedData);
        setTrialBalance(processedData);
      }
    } catch (error) {
      console.error('Error fetching trial balance:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch trial balance');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    console.log('Date changed to:', dateValue);
    setAsOfDate(dateValue);
  };

  const handleGenerateReport = () => {
    fetchTrialBalance();
  };

  const handleExportPDF = async () => {
    setExportLoading(true);
    try {
      const blob = await financialReportService.exportReport(
        'trial-balance',
        'pdf',
        { asOfDate }
      );
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trial-balance-${asOfDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Trial balance exported successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to export trial balance');
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setExportLoading(true);
    try {
      const blob = await financialReportService.exportReport(
        'trial-balance',
        'excel',
        { asOfDate }
      );
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trial-balance-${asOfDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Trial balance exported successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to export trial balance');
    } finally {
      setExportLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
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

  // Calculate debit and credit amounts for display
  const getAccountBalances = (account: any) => {
    if (!account) return { debit: 0, credit: 0 };
    
    const accountType = account.accountType || '';
    const balance = Number(account.balance) || 0;
    
    console.log(`Processing account: ${account.name}, type: ${accountType}, balance: ${balance}`);
    
    // For asset and expense accounts, positive balance is debit, negative is credit
    if (accountType === 'ASSET' || accountType === 'EXPENSE') {
      return {
        debit: balance > 0 ? Math.abs(balance) : 0,
        credit: balance < 0 ? Math.abs(balance) : 0
      };
    }
    
    // For liability, equity, and income accounts, positive balance is credit, negative is debit
    return {
      debit: balance < 0 ? Math.abs(balance) : 0,
      credit: balance > 0 ? Math.abs(balance) : 0
    };
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
              <h1 className="text-2xl font-semibold text-gray-900">Trial Balance</h1>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                onClick={handleExportPDF}
                disabled={exportLoading || loading || !trialBalance}
              >
                <DocumentArrowDownIcon className="h-5 w-5 mr-1" />
                Export PDF
              </Button>
              <Button
                variant="secondary"
                onClick={handleExportExcel}
                disabled={exportLoading || loading || !trialBalance}
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
                  <label htmlFor="asOfDate" className="block text-sm font-medium text-gray-700 mb-1">
                    As of Date
                  </label>
                  <input
                    type="date"
                    id="asOfDate"
                    name="asOfDate"
                    value={asOfDate}
                    onChange={handleDateChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="md:col-span-2 flex items-end">
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
              <p className="mt-2 text-gray-500">Loading trial balance...</p>
            </div>
          ) : trialBalance ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Trial Balance as of {formatDate(trialBalance.asOfDate)}
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account Code
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Debit
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Credit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.isArray(trialBalance.accounts) && trialBalance.accounts.map(account => {
                      if (!account) return null;
                      const { debit, credit } = getAccountBalances(account);
                      return (
                        <tr key={account.id || account.accountCode}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {account.accountCode || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {account.name || 'Unknown Account'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {account.accountType || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {debit > 0 ? formatCurrency(debit) : ''}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {credit > 0 ? formatCurrency(credit) : ''}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <th scope="row" colSpan={3} className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                        Totals
                      </th>
                      <th scope="row" className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                        {formatCurrency(trialBalance.totals?.debit || 0)}
                      </th>
                      <th scope="row" className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                        {formatCurrency(trialBalance.totals?.credit || 0)}
                      </th>
                    </tr>
                    <tr>
                      <th scope="row" colSpan={3} className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                        Difference
                      </th>
                      <th scope="row" colSpan={2} className={`px-6 py-3 text-right text-sm font-bold ${
                        (trialBalance.totals?.difference === 0) ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(Math.abs(trialBalance.totals?.difference || 0))}
                        {(trialBalance.totals?.difference === 0) ? ' (Balanced)' : ' (Unbalanced)'}
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No trial balance data available. Please generate a report.</p>
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default TrialBalancePage;