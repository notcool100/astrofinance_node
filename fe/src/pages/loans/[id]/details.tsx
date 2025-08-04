import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import loanService, { Loan, LoanSchedule, LoanPayment } from '@/services/loanService';
import { 
  ArrowLeftIcon, 
  CreditCardIcon, 
  DocumentTextIcon, 
  CalculatorIcon, 
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const LoanStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'ACTIVE':
      return <Badge variant="primary">Active</Badge>;
    case 'CLOSED':
      return <Badge variant="success">Closed</Badge>;
    case 'DEFAULTED':
      return <Badge variant="danger">Defaulted</Badge>;
    case 'WRITTEN_OFF':
      return <Badge variant="secondary">Written Off</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const LoanDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [settlementAmount, setSettlementAmount] = useState<number | null>(null);
  const [isCalculatingSettlement, setIsCalculatingSettlement] = useState(false);
  const [isSettling, setIsSettling] = useState(false);

  // Fetch loan details
  const { data: loan, isLoading: isLoadingLoan } = useQuery(
    ['loan', id],
    () => loanService.getLoanById(id as string),
    {
      enabled: !!id,
      onError: (error) => {
        toast.error('Failed to load loan details');
        console.error('Error fetching loan:', error);
      },
    }
  );

  // Fetch loan schedule
  const { data: schedule, isLoading: isLoadingSchedule } = useQuery(
    ['loanSchedule', id],
    () => loanService.getLoanSchedule(id as string),
    {
      enabled: !!id,
      onError: (error) => {
        toast.error('Failed to load repayment schedule');
        console.error('Error fetching schedule:', error);
      },
    }
  );

  // Fetch loan payments
  const { data: payments, isLoading: isLoadingPayments } = useQuery(
    ['loanPayments', id],
    () => loanService.getLoanPayments(id as string),
    {
      enabled: !!id,
      onError: (error) => {
        toast.error('Failed to load payment history');
        console.error('Error fetching payments:', error);
      },
    }
  );

  // Mock data for now
  const mockLoan: Loan = {
    id: id as string || 'L-1001',
    loanNumber: 'LN-1001',
    userId: 'user-1',
    applicationId: 'LA-1001',
    amount: 10000,
    tenure: 12,
    interestRate: 12,
    interestType: 'DIMINISHING',
    emi: 888.49,
    disbursementDate: '2023-01-15',
    status: 'ACTIVE',
    loanType: {
      id: '1',
      name: 'Personal Loan',
      code: 'PL',
      interestType: 'DIMINISHING',
      minAmount: 1000,
      maxAmount: 50000,
      minTenure: 3,
      maxTenure: 36,
      interestRate: 12,
      processingFeePercent: 2,
      lateFeeAmount: 500,
      isActive: true,
    },
  };

  // Generate mock schedule
  const generateMockSchedule = (): LoanSchedule[] => {
    const result: LoanSchedule[] = [];
    const principal = 10000;
    const rate = 12 / 12 / 100; // Monthly interest rate
    const tenure = 12;
    const emi = 888.49;
    
    let balance = principal;
    const startDate = new Date('2023-02-15');
    
    for (let i = 1; i <= tenure; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(startDate.getMonth() + i - 1);
      
      const interest = balance * rate;
      const principalPart = emi - interest;
      balance -= principalPart;
      
      // Set some installments as paid for demonstration
      const status = i <= 3 ? 'PAID' : i === 4 ? 'OVERDUE' : 'PENDING';
      const paymentId = i <= 3 ? `payment-${i}` : undefined;
      
      result.push({
        installmentNumber: i,
        dueDate: dueDate.toISOString().split('T')[0],
        principal: principalPart,
        interest: interest,
        amount: emi,
        balance: Math.max(0, balance),
        status,
        paymentId,
      });
    }
    
    return result;
  };

  // Generate mock payments
  const generateMockPayments = (): LoanPayment[] => {
    const result: LoanPayment[] = [];
    const schedule = generateMockSchedule();
    
    // Create payments for paid installments
    for (let i = 0; i < 3; i++) {
      const installment = schedule[i];
      const paymentDate = new Date(installment.dueDate);
      
      // Some payments made on time, some late
      if (i === 1) {
        paymentDate.setDate(paymentDate.getDate() + 2);
      }
      
      result.push({
        id: `payment-${i + 1}`,
        loanId: id as string,
        amount: installment.amount,
        paymentDate: paymentDate.toISOString().split('T')[0],
        paymentMethod: i === 0 ? 'CASH' : i === 1 ? 'BANK_TRANSFER' : 'ONLINE',
        reference: i === 0 ? undefined : `REF-${1000 + i}`,
        status: 'COMPLETED',
      });
    }
    
    return result;
  };

  const mockSchedule = generateMockSchedule();
  const mockPayments = generateMockPayments();
  
  const loanData = loan || mockLoan;
  const scheduleData = schedule || mockSchedule;
  const paymentsData = payments || mockPayments;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateTotalPaid = () => {
    return paymentsData.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const calculateRemainingAmount = () => {
    const totalLoanAmount = loanData.amount + calculateTotalInterest();
    return totalLoanAmount - calculateTotalPaid();
  };

  const calculateTotalInterest = () => {
    return loanData.emi * loanData.tenure - loanData.amount;
  };

  const calculateProgress = () => {
    const totalPaid = calculateTotalPaid();
    const totalAmount = loanData.amount + calculateTotalInterest();
    return (totalPaid / totalAmount) * 100;
  };

  const getNextDueInstallment = () => {
    return scheduleData.find(installment => 
      installment.status === 'PENDING' || installment.status === 'OVERDUE'
    );
  };

  const handleSettlementClick = async () => {
    setIsSettlementModalOpen(true);
    setIsCalculatingSettlement(true);
    
    try {
      // In a real implementation, we would call the API
      // const result = await loanService.calculateSettlement(id as string, {
      //   settlementDate: new Date().toISOString().split('T')[0],
      // });
      // setSettlementAmount(result.totalSettlementAmount);
      
      // Mock calculation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Calculate remaining principal + 1 month interest as settlement amount
      const remainingPrincipal = scheduleData
        .filter(i => i.status !== 'PAID')
        .reduce((sum, i) => sum + i.principal, 0);
      
      const oneMonthInterest = remainingPrincipal * (loanData.interestRate / 12 / 100);
      
      setSettlementAmount(remainingPrincipal + oneMonthInterest);
    } catch (error) {
      toast.error('Failed to calculate settlement amount');
      console.error('Error calculating settlement:', error);
      setIsSettlementModalOpen(false);
    } finally {
      setIsCalculatingSettlement(false);
    }
  };

  const handleSettleLoan = async () => {
    if (!settlementAmount) return;
    
    setIsSettling(true);
    try {
      // In a real implementation, we would call the API
      // await loanService.settleLoan(id as string, {
      //   settlementDate: new Date().toISOString().split('T')[0],
      //   amount: settlementAmount,
      //   paymentMethod: 'BANK_TRANSFER',
      //   reference: `SETTLE-${Date.now()}`,
      // });
      
      // Mock success
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Loan settled successfully');
      setIsSettlementModalOpen(false);
      
      // Redirect to loans list after a delay
      setTimeout(() => {
        router.push('/loans');
      }, 1500);
    } catch (error) {
      toast.error('Failed to settle loan');
      console.error('Error settling loan:', error);
    } finally {
      setIsSettling(false);
    }
  };

  const nextDueInstallment = getNextDueInstallment();

  if (isLoadingLoan || isLoadingSchedule || isLoadingPayments) {
    return (
      <ProtectedRoute>
        <MainLayout title="Loan Details">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout title={`Loan ${loanData.loanNumber}`}>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Button
                variant="secondary"
                className="mr-4"
                onClick={() => router.push('/loans')}
              >
                <ArrowLeftIcon className="h-5 w-5 mr-1" />
                Back to Loans
              </Button>
              <h1 className="text-2xl font-semibold text-gray-900">
                Loan {loanData.loanNumber}
              </h1>
              <div className="ml-4">
                <LoanStatusBadge status={loanData.status} />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                icon={<CalculatorIcon className="h-5 w-5 mr-1" />}
                onClick={() => router.push(`/loans/calculator?loanTypeId=${loanData.loanType?.id}`)}
              >
                Loan Calculator
              </Button>
              {loanData.status === 'ACTIVE' && (
                <Button
                  variant="primary"
                  icon={<CreditCardIcon className="h-5 w-5 mr-1" />}
                  onClick={() => router.push(`/loans/${id}/repayment`)}
                >
                  Make Payment
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card>
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Loan Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Loan Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">{loanData.loanType?.name || 'Personal Loan'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Principal Amount</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatCurrency(loanData.amount)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Interest Rate</dt>
                    <dd className="mt-1 text-sm text-gray-900">{loanData.interestRate}% per annum ({loanData.interestType === 'FLAT' ? 'Flat Rate' : 'Reducing Balance'})</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Tenure</dt>
                    <dd className="mt-1 text-sm text-gray-900">{loanData.tenure} months</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Monthly EMI</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatCurrency(loanData.emi)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Disbursement Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(loanData.disbursementDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <LoanStatusBadge status={loanData.status} />
                    </dd>
                  </div>
                  {loanData.closureDate && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Closure Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(loanData.closureDate)}</dd>
                    </div>
                  )}
                </div>

                {loanData.status === 'ACTIVE' && (
                  <div className="mt-6 space-y-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      icon={<DocumentTextIcon className="h-5 w-5 mr-1" />}
                      onClick={() => router.push(`/loans/${id}/statement`)}
                    >
                      View Loan Statement
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      icon={<BanknotesIcon className="h-5 w-5 mr-1" />}
                      onClick={handleSettlementClick}
                    >
                      Settle Loan Early
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            <div className="lg:col-span-2">
              <Card>
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Loan Summary</h3>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <dt className="text-sm font-medium text-gray-500">Total Loan Amount</dt>
                      <dd className="mt-1 text-xl font-semibold text-gray-900">
                        {formatCurrency(loanData.amount + calculateTotalInterest())}
                      </dd>
                      <p className="mt-1 text-xs text-gray-500">
                        Principal: {formatCurrency(loanData.amount)} + Interest: {formatCurrency(calculateTotalInterest())}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md">
                      <dt className="text-sm font-medium text-gray-500">Amount Paid</dt>
                      <dd className="mt-1 text-xl font-semibold text-gray-900">
                        {formatCurrency(calculateTotalPaid())}
                      </dd>
                      <p className="mt-1 text-xs text-gray-500">
                        {paymentsData.length} payment(s) made
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md">
                      <dt className="text-sm font-medium text-gray-500">Remaining Amount</dt>
                      <dd className="mt-1 text-xl font-semibold text-gray-900">
                        {formatCurrency(calculateRemainingAmount())}
                      </dd>
                      <p className="mt-1 text-xs text-gray-500">
                        {scheduleData.filter(i => i.status !== 'PAID').length} installment(s) remaining
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Repayment Progress</span>
                      <span className="text-sm font-medium text-gray-700">
                        {Math.round(calculateProgress())}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-primary-600 h-2.5 rounded-full" 
                        style={{ width: `${calculateProgress()}%` }}
                      ></div>
                    </div>
                  </div>

                  {nextDueInstallment && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Next Payment Due</h4>
                      <div className="bg-yellow-50 border border-yellow-100 rounded-md p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Installment #{nextDueInstallment.installmentNumber}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              Due Date: {formatDate(nextDueInstallment.dueDate)}
                            </p>
                            {nextDueInstallment.status === 'OVERDUE' && (
                              <p className="mt-1 text-sm text-red-500">
                                This payment is overdue
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Amount Due</p>
                            <p className="text-xl font-semibold text-gray-900">
                              {formatCurrency(nextDueInstallment.amount)}
                            </p>
                            <Button
                              variant="primary"
                              size="sm"
                              className="mt-2"
                              onClick={() => router.push(`/loans/${id}/repayment`)}
                            >
                              Pay Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="mt-6">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Payments</h3>
                    <Button
                      variant="link"
                      onClick={() => router.push(`/loans/${id}/payments`)}
                    >
                      View All
                    </Button>
                  </div>
                  
                  {paymentsData.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Method
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Reference
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {paymentsData.slice(0, 5).map((payment) => (
                            <tr key={payment.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(payment.paymentDate)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                {formatCurrency(payment.amount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {payment.paymentMethod}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {payment.reference || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-gray-500">No payments recorded yet</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          <Card>
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Repayment Schedule</h3>
                <Button
                  variant="link"
                  onClick={() => router.push(`/loans/${id}/repayment`)}
                >
                  View Full Schedule
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No.
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        EMI
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Principal
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Interest
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {scheduleData.slice(0, 6).map((installment) => (
                      <tr key={installment.installmentNumber} className={
                        installment.status === 'OVERDUE' ? 'bg-red-50' : 
                        installment.status === 'PAID' ? 'bg-green-50' : ''
                      }>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {installment.installmentNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(installment.dueDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatCurrency(installment.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatCurrency(installment.principal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatCurrency(installment.interest)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          {installment.status === 'PAID' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Paid
                            </span>
                          ) : installment.status === 'OVERDUE' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Overdue
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {scheduleData.length > 6 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                          <Button
                            variant="link"
                            onClick={() => router.push(`/loans/${id}/repayment`)}
                          >
                            View all {scheduleData.length} installments
                          </Button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>

        {/* Settlement Modal */}
        {isSettlementModalOpen && (
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100">
                    <BanknotesIcon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Early Settlement</h3>
                    <div className="mt-2">
                      {isCalculatingSettlement ? (
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-500"></div>
                        </div>
                      ) : settlementAmount ? (
                        <div>
                          <p className="text-sm text-gray-500">
                            You can settle your loan early by paying the settlement amount below. This will close your loan and you will not have to make any further payments.
                          </p>
                          <div className="mt-4 bg-gray-50 p-4 rounded-md">
                            <p className="text-sm text-gray-500">Settlement Amount</p>
                            <p className="text-2xl font-semibold text-gray-900">
                              {formatCurrency(settlementAmount)}
                            </p>
                            <p className="mt-2 text-xs text-gray-500">
                              Valid until: {formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())}
                            </p>
                          </div>
                          <div className="mt-4">
                            <p className="text-sm text-gray-500">
                              By settling early, you save approximately {formatCurrency(calculateRemainingAmount() - settlementAmount)} compared to continuing with your regular EMI payments.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Failed to calculate settlement amount. Please try again.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  {settlementAmount && !isCalculatingSettlement && (
                    <Button
                      variant="primary"
                      className="w-full sm:col-start-2"
                      onClick={handleSettleLoan}
                      isLoading={isSettling}
                    >
                      Proceed to Payment
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    className="w-full sm:col-start-1 mt-3 sm:mt-0"
                    onClick={() => setIsSettlementModalOpen(false)}
                    disabled={isCalculatingSettlement || isSettling}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </MainLayout>
    </ProtectedRoute>
  );
};

export default LoanDetailsPage;