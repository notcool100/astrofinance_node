import React, { useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import LoanCalculator from '@/components/calculators/LoanCalculator';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Button from '@/components/common/Button';
import { 
  CalculatorIcon, 
  CurrencyDollarIcon, 
  ClockIcon, 
  ChartBarIcon,
  PrinterIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const LoanCalculatorPage = () => {
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useCallback(() => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      
      document.body.innerHTML = `
        <div class="print-container">
          <div class="print-header" style="text-align: center; margin-bottom: 20px;">
            <h1 style="font-size: 24px; font-weight: bold;">Loan EMI Calculation Summary</h1>
            <p style="font-size: 14px; color: #666;">Generated on ${new Date().toLocaleString()}</p>
          </div>
          ${printContents}
          <div class="print-footer" style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
            <p>This is a computer-generated document and does not require a signature.</p>
            <p>For any queries, please contact our support team.</p>
          </div>
        </div>
      `;
      
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  }, []);
  
  return (
    <ProtectedRoute>
      <MainLayout title="Loan EMI Calculator">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Loan EMI Calculator</h1>
              <p className="mt-1 text-sm text-gray-500">
                Calculate your monthly EMI, total interest, and view amortization schedule
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                icon={<ArrowLeftIcon className="h-4 w-4 mr-1" />}
                onClick={() => router.back()}
              >
                Back
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<PrinterIcon className="h-4 w-4 mr-1" />}
                onClick={handlePrint}
              >
                Print Results
              </Button>
            </div>
          </div>

          <div ref={printRef}>
            <LoanCalculator />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CalculatorIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">EMI Calculation</dt>
                      <dd>
                        <p className="text-sm text-gray-900">
                          Calculate your monthly EMI based on loan amount, tenure, and interest rate.
                        </p>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CurrencyDollarIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Interest Comparison</dt>
                      <dd>
                        <p className="text-sm text-gray-900">
                          Compare total interest payable between flat and reducing balance methods.
                        </p>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Tenure Impact</dt>
                      <dd>
                        <p className="text-sm text-gray-900">
                          See how changing the loan tenure affects your EMI and total interest.
                        </p>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Amortization Schedule</dt>
                      <dd>
                        <p className="text-sm text-gray-900">
                          View detailed month-by-month breakdown of principal and interest payments.
                        </p>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Understanding Loan Calculations</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Learn about different interest calculation methods and how they affect your loan.
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Flat Rate Method</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    In the flat rate method, interest is calculated on the full principal amount throughout the loan tenure.
                    The EMI remains constant, but the effective interest rate is higher than the stated rate.
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    <strong>Formula:</strong> EMI = (Principal + Total Interest) / Tenure
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    <strong>Total Interest:</strong> Principal × Interest Rate × (Tenure / 12)
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Reducing Balance Method</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    In the reducing balance method, interest is calculated on the outstanding principal amount.
                    As you pay each installment, the principal reduces, and so does the interest component.
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    <strong>Formula:</strong> EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Where P = Principal, r = Monthly Interest Rate, n = Tenure in months
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Which Method Is Better?</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    The reducing balance method is generally more favorable for borrowers as it results in lower total interest payments.
                    However, flat rate loans may have lower stated interest rates, so it's important to compare the effective interest rates.
                  </p>
                </div>
              </div>
            </div>
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

export default LoanCalculatorPage;
