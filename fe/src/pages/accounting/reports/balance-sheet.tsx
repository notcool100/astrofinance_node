import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeftIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import MainLayout from '../../../components/layout/MainLayout';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import financialReportService, { BalanceSheet } from '../../../services/financial-report.service';
import FiscalYearSelect from '@/components/common/FiscalYearSelect';

const BalanceSheetPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheet | null>(null);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string | undefined>(undefined);
  // Initialize with today's date in YYYY-MM-DD format
  const [asOfDate, setAsOfDate] = useState<string>(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // YYYY-MM-DD format
  });

  useEffect(() => {
    // Only fetch on initial load, not on every asOfDate change
    // The user will explicitly request updates via the Generate Report button
    fetchBalanceSheet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBalanceSheet = async () => {
    setLoading(true);
    try {
      // Use a direct approach to fetch the data
      const formattedDate = asOfDate ? asOfDate.split('T')[0] : '';
      console.log('Fetching balance sheet for date:', formattedDate, 'FY:', selectedFiscalYear);

      // Call the service and get the data
      const data = await financialReportService.getBalanceSheet(formattedDate || undefined, selectedFiscalYear);
      console.log('Balance sheet data received:', data);

      if (!data) {
        console.error('No data returned from balance sheet API');
        toast.error('Failed to fetch balance sheet data');
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

      // Create a properly formatted balance sheet object
      const assetTotal = calculateTotal(data.assetAccounts);
      const liabilityTotal = calculateTotal(data.liabilityAccounts);
      const equityTotal = calculateTotal(data.equityAccounts);

      const processedData = {
        asOfDate: data.asOfDate || formattedDate,
        assetAccounts: Array.isArray(data.assetAccounts) ? data.assetAccounts : [],
        liabilityAccounts: Array.isArray(data.liabilityAccounts) ? data.liabilityAccounts : [],
        equityAccounts: Array.isArray(data.equityAccounts) ? data.equityAccounts : [],
        totalAssets: assetTotal,
        totalLiabilities: liabilityTotal,
        totalEquity: equityTotal,
        liabilitiesAndEquity: liabilityTotal + equityTotal
      };

      console.log('Processed balance sheet data:', processedData);
      setBalanceSheet(processedData);
    } catch (error) {
      console.error('Error fetching balance sheet:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch balance sheet');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Store date in YYYY-MM-DD format
    const dateValue = e.target.value;
    console.log('Date changed to:', dateValue);
    setAsOfDate(dateValue);
  };

  const handleGenerateReport = () => {
    fetchBalanceSheet();
  };

  const handleExportPDF = async () => {
    setExportLoading(true);
    try {
      const blob = await financialReportService.exportReport(
        'balance-sheet',
        'pdf',
        { asOfDate, ...(selectedFiscalYear ? { fiscalYearId: selectedFiscalYear } : {}) }
      );

      const fileNameStr = selectedFiscalYear ? `balance-sheet-FY` : `balance-sheet-${asOfDate}`;

      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileNameStr}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Balance sheet exported successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to export balance sheet');
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setExportLoading(true);
    try {
      const blob = await financialReportService.exportReport(
        'balance-sheet',
        'excel',
        { asOfDate, ...(selectedFiscalYear ? { fiscalYearId: selectedFiscalYear } : {}) }
      );

      const fileNameStr = selectedFiscalYear ? `balance-sheet-FY` : `balance-sheet-${asOfDate}`;

      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileNameStr}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Balance sheet exported successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to export balance sheet');
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
              <h1 className="text-2xl font-semibold text-gray-900">Balance Sheet</h1>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                onClick={handleExportPDF}
                disabled={exportLoading || loading || !balanceSheet}
              >
                <DocumentArrowDownIcon className="h-5 w-5 mr-1" />
                Export PDF
              </Button>
              <Button
                variant="secondary"
                onClick={handleExportExcel}
                disabled={exportLoading || loading || !balanceSheet}
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
                  <FiscalYearSelect
                    value={selectedFiscalYear}
                    onChange={(val) => {
                      setSelectedFiscalYear(val);
                      // Clear date if FY is selected to avoid confusion? 
                      // Or simply let fetched data override logic. 
                      // Backend logic prioritizes FY over Date if FY is sent? 
                      // Actually code checks: if (fy) override start/end. 
                      // But Balance Sheet uses "asOfDate". 
                      // Controller logic: if (fy && !asOfDate) asOfDate = fy.endDate. 
                      // So if user selects FY, we should probably clear asOfDate or let user know FY takes precedence?
                      // Let's clear manual date if FY selected for clarity.
                      if (val) setAsOfDate('');
                    }}
                    label="Fiscal Year (Overrides Date)"
                  />
                </div>
                <div>
                  <label htmlFor="asOfDate" className="block text-sm font-medium text-gray-700 mb-1">
                    As of Date {selectedFiscalYear && <span className="text-xs text-gray-500">(Optional if FY selected)</span>}
                  </label>
                  <input
                    type="date"
                    id="asOfDate"
                    name="asOfDate"
                    value={asOfDate}
                    onChange={(e) => {
                      handleDateChange(e);
                      // If user picks specific date, maybe clear FY?
                      if (e.target.value) setSelectedFiscalYear(undefined);
                    }}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    variant="primary"
                    onClick={handleGenerateReport}
                    disabled={loading}
                    className="w-full"
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
              <p className="mt-2 text-gray-500">Loading balance sheet...</p>
            </div>
          ) : balanceSheet ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Balance Sheet as of {formatDate(balanceSheet.asOfDate)}
                </h3>
              </div>

              {/* Assets Section */}
              <div className="border-b border-gray-200">
                <div className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assets
                </div>
                <div className="divide-y divide-gray-200">
                  {balanceSheet.assetAccounts.length > 0 ? (
                    balanceSheet.assetAccounts.map(account => (
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
                      No asset accounts with balances
                    </div>
                  )}
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 font-bold bg-gray-50">
                    <dt className="text-sm text-gray-900">Total Assets</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 text-right">
                      {formatCurrency(balanceSheet.totalAssets)}
                    </dd>
                  </div>
                </div>
              </div>

              {/* Liabilities Section */}
              <div className="border-b border-gray-200">
                <div className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liabilities
                </div>
                <div className="divide-y divide-gray-200">
                  {balanceSheet.liabilityAccounts.length > 0 ? (
                    balanceSheet.liabilityAccounts.map(account => (
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
                      No liability accounts with balances
                    </div>
                  )}
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 font-bold bg-gray-50">
                    <dt className="text-sm text-gray-900">Total Liabilities</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 text-right">
                      {formatCurrency(balanceSheet.totalLiabilities)}
                    </dd>
                  </div>
                </div>
              </div>

              {/* Equity Section */}
              <div className="border-b border-gray-200">
                <div className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Equity
                </div>
                <div className="divide-y divide-gray-200">
                  {balanceSheet.equityAccounts.length > 0 ? (
                    balanceSheet.equityAccounts.map(account => (
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
                      No equity accounts with balances
                    </div>
                  )}
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 font-bold bg-gray-50">
                    <dt className="text-sm text-gray-900">Total Equity</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 text-right">
                      {formatCurrency(balanceSheet.totalEquity)}
                    </dd>
                  </div>
                </div>
              </div>

              {/* Total Liabilities and Equity */}
              <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 font-bold bg-gray-100">
                <dt className="text-sm text-gray-900">Total Liabilities and Equity</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 text-right">
                  {formatCurrency(balanceSheet.liabilitiesAndEquity)}
                </dd>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No balance sheet data available. Please generate a report.</p>
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

export default BalanceSheetPage;
